-- 002_rls_and_triggers.sql
BEGIN;

-- Security helper functions
create or replace function is_group_member(g uuid, u uuid)
returns boolean language sql security definer set search_path=public as $$
  select exists(
    select 1 from group_members gm
    where gm.group_id = g and gm.user_id = u and gm.status = 'active'
  );
$$;
grant execute on function is_group_member(uuid,uuid) to authenticated;

create or replace function is_group_admin(g uuid, u uuid)
returns boolean language sql security definer set search_path=public as $$
  select exists(
    select 1 from group_members gm
    where gm.group_id = g and gm.user_id = u and gm.status = 'active' and gm.role in ('owner','admin')
  );
$$;
grant execute on function is_group_admin(uuid,uuid) to authenticated;

create or replace function round_group_id(r uuid)
returns uuid language sql stable set search_path=public as $$
  select group_id from daily_rounds where id = r
$$;
grant execute on function round_group_id(uuid) to authenticated;

-- App creator helper (email compare via GUC app.app_creator_email)
create or replace function is_app_creator()
returns boolean language sql security definer set search_path=public as $$
  select coalesce(auth.jwt() ->> 'email','') = current_setting('app.app_creator_email', true)
$$;
grant execute on function is_app_creator() to authenticated;

-- Participation function (RLS gating)
create or replace function user_has_participated(r uuid, u uuid)
returns boolean language sql security definer set search_path=public as $$
  select exists(select 1 from submissions s where s.round_id=r and s.author_id=u)
      or exists(select 1 from round_votes v where v.round_id=r and v.voter_id=u)
$$;
grant execute on function user_has_participated(uuid,uuid) to authenticated;

-- Triggers: normalize join_code to UPPER and validate
create or replace function normalize_join_code()
returns trigger language plpgsql as $$
begin
  if NEW.join_code is null then
    return NEW;
  end if;
  NEW.join_code := upper(NEW.join_code);
  if NEW.join_code !~ '^[A-Z0-9]{6}$' then
    raise exception 'Invalid join_code format (must be 6 alphanumerics)';
  end if;
  return NEW;
end;$$;
drop trigger if exists trg_groups_join_code on groups;
create trigger trg_groups_join_code
before insert or update of join_code on groups
for each row execute function normalize_join_code();

-- Partial unique index for single active owner per group
create unique index if not exists uniq_active_owner_per_group
  on group_members(group_id) where role='owner' and status='active';

-- Prevent removing last active owner
create or replace function prevent_removing_last_owner()
returns trigger language plpgsql as $$
declare exists_other boolean;
begin
  if TG_OP = 'DELETE' then
    if OLD.role='owner' and OLD.status='active' then
      select exists(
        select 1 from group_members gm
        where gm.group_id = OLD.group_id and gm.user_id <> OLD.user_id and gm.role='owner' and gm.status='active'
      ) into exists_other;
      if not exists_other then
        raise exception 'Cannot remove the last active owner of the group';
      end if;
    end if;
    return OLD;
  elsif TG_OP = 'UPDATE' then
    if OLD.role='owner' and OLD.status='active' and (NEW.role <> 'owner' or NEW.status <> 'active') then
      select exists(
        select 1 from group_members gm
        where gm.group_id = OLD.group_id and gm.user_id <> OLD.user_id and gm.role='owner' and gm.status='active'
      ) into exists_other;
      if not exists_other then
        raise exception 'Cannot remove the last active owner of the group';
      end if;
    end if;
    return NEW;
  end if;
  return NEW;
end$$;
drop trigger if exists trg_prevent_last_owner on group_members;
create trigger trg_prevent_last_owner
before update or delete on group_members
for each row execute function prevent_removing_last_owner();

-- Round ↔ prompt coherence when snapshot is set
create or replace function check_round_prompt_scope()
returns trigger language plpgsql as $$
declare s text; og uuid;
begin
  if NEW.source_prompt_id is null then return NEW; end if;
  select scope, owner_group_id into s, og from prompts where id = NEW.source_prompt_id;
  if s is null then
    raise exception 'Snapshot prompt not found';
  end if;
  if s = 'group' and og <> NEW.group_id then
    raise exception 'Local prompt belongs to another group';
  end if;
  if s = 'global' and og is not null then
    raise exception 'Global prompt must have NULL owner_group_id';
  end if;
  return NEW;
end$$;
drop trigger if exists trg_round_prompt on daily_rounds;
create trigger trg_round_prompt
before insert or update of source_prompt_id on daily_rounds
for each row execute function check_round_prompt_scope();

-- Votes: integrity + immutability
create or replace function check_vote_integrity()
returns trigger language plpgsql as $$
declare g uuid;
begin
  select group_id into g from daily_rounds where id = NEW.round_id;
  if not exists (
    select 1 from group_members gm where gm.group_id = g and gm.user_id = NEW.target_user_id and gm.status='active'
  ) then
    raise exception 'Target user must be an active member of the round group';
  end if;
  return NEW;
end$$;
drop trigger if exists trg_vote_integrity on round_votes;
create trigger trg_vote_integrity
before insert on round_votes
for each row execute function check_vote_integrity();

create or replace function prevent_vote_modification()
returns trigger language plpgsql as $$
begin
  raise exception 'Votes are definitive and cannot be modified or deleted';
end$$;
drop trigger if exists trg_vote_no_update on round_votes;
create trigger trg_vote_no_update
before update on round_votes
for each row execute function prevent_vote_modification();
drop trigger if exists trg_vote_no_delete on round_votes;
create trigger trg_vote_no_delete
before delete on round_votes
for each row execute function prevent_vote_modification();

-- Comments: lock after close, allow admin soft delete
create or replace function check_comment_modification_allowed()
returns trigger language plpgsql as $$
declare st text;
begin
  select status into st from daily_rounds where id = coalesce(NEW.round_id, OLD.round_id);
  if st = 'closed' then
    if TG_OP = 'UPDATE' then
      if not (OLD.deleted_by_admin is null and NEW.deleted_by_admin is not null and NEW.deleted_at is not null) then
        raise exception 'Cannot modify comments after round is closed';
      end if;
    elsif TG_OP = 'DELETE' then
      raise exception 'Use soft delete for moderation after round closure';
    end if;
  end if;
  return coalesce(NEW, OLD);
end$$;
drop trigger if exists trg_comments_lock on comments;
create trigger trg_comments_lock
before update or delete on comments
for each row execute function check_comment_modification_allowed();

-- RLS enable
alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_settings enable row level security;
alter table prompts enable row level security;
alter table prompt_tags enable row level security;
alter table prompt_tag_links enable row level security;
alter table group_prompt_blocks enable row level security;
alter table daily_rounds enable row level security;
alter table submissions enable row level security;
alter table submission_media enable row level security;
alter table comments enable row level security;
alter table round_votes enable row level security;
alter table notifications enable row level security;
alter table user_devices enable row level security;
alter table user_group_prefs enable row level security;
alter table group_ownership_transfers enable row level security;

-- Policies (table-by-table, simplifiées selon matrix)

-- profiles
create policy profiles_select_auth on profiles for select using (auth.role() = 'authenticated');
create policy profiles_update_self on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- groups
create policy groups_select_members on groups for select using (
  exists (select 1 from group_members gm where gm.group_id = id and gm.user_id = auth.uid())
);
create policy groups_insert_owner_self on groups for insert with check (owner_id = auth.uid());
create policy groups_update_admin on groups for update using (
  is_group_admin(id, auth.uid())
) with check (is_group_admin(id, auth.uid()));
create policy groups_delete_owner on groups for delete using (
  exists (select 1 from group_members gm where gm.group_id = id and gm.user_id = auth.uid() and gm.role='owner' and gm.status='active')
);

-- group_members
create policy group_members_select_members on group_members for select using (
  exists (select 1 from group_members gm2 where gm2.group_id = group_id and gm2.user_id = auth.uid())
);
create policy group_members_insert_self_join on group_members for insert with check (
  user_id = auth.uid()
);
create policy group_members_update_roles on group_members for update using (
  exists (select 1 from group_members gm2 where gm2.group_id = group_id and gm2.user_id = auth.uid() and gm2.role='owner' and gm2.status='active')
) with check (true);
create policy group_members_leave_self on group_members for delete using (
  user_id = auth.uid()
);

-- group_settings
create policy group_settings_select_members on group_settings for select using (
  exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
);
create policy group_settings_update_admin on group_settings for update using (
  is_group_admin(group_id, auth.uid())
) with check (is_group_admin(group_id, auth.uid()));

-- prompts
create policy prompts_select_visible on prompts for select using (
  (scope='global' and status='approved')
  or (scope='group' and exists (select 1 from group_members gm where gm.group_id = owner_group_id and gm.user_id = auth.uid()))
);
create policy prompts_insert_local on prompts for insert with check (
  scope='group' and exists (
    select 1 from group_members gm where gm.group_id = owner_group_id and gm.user_id = auth.uid() and gm.role in ('owner','admin') and gm.status='active'
  )
);
create policy prompts_insert_suggestion on prompts for insert with check (
  scope='group' and status='pending' and exists (
    select 1 from group_members gm where gm.group_id = owner_group_id and gm.user_id = auth.uid() and gm.status='active'
  )
);
create policy prompts_update_local_admin on prompts for update using (
  scope='group' and exists (
    select 1 from group_members gm where gm.group_id = owner_group_id and gm.user_id = auth.uid() and gm.role in ('owner','admin') and gm.status='active'
  )
) with check (true);
create policy prompts_update_global_creator on prompts for update using (is_app_creator()) with check (is_app_creator());

-- prompt_tags & links
create policy prompt_tags_select_all on prompt_tags for select using (auth.role() = 'authenticated');
create policy prompt_tag_links_select_visible on prompt_tag_links for select using (
  exists (
    select 1 from prompts p where p.id = prompt_id and (
      (p.scope='global' and p.status='approved') or
      (p.scope='group' and exists (select 1 from group_members gm where gm.group_id = p.owner_group_id and gm.user_id = auth.uid()))
    )
  )
);

-- group_prompt_blocks
create policy gpb_select_members on group_prompt_blocks for select using (
  exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
);
create policy gpb_mutate_admin on group_prompt_blocks for all using (
  is_group_admin(group_id, auth.uid())
) with check (is_group_admin(group_id, auth.uid()));

-- daily_rounds
create policy rounds_select_members on daily_rounds for select using (
  exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
);

-- submissions
create policy submissions_select_visibility on submissions for select using (
  (select status from daily_rounds dr where dr.id = round_id) = 'closed'
  or user_has_participated(round_id, auth.uid())
);
create policy submissions_insert_member_open on submissions for insert with check (
  exists (select 1 from group_members gm where gm.group_id = round_group_id(round_id) and gm.user_id = auth.uid() and gm.status='active')
  and (select status from daily_rounds dr where dr.id = round_id) = 'open'
);
-- Author updates blocked by default (no policy). Admin soft delete via comments policy analogue is handled app-side; keep no UPDATE policy here.

-- submission_media
create policy subm_media_select on submission_media for select using (
  exists (
    select 1 from submissions s where s.id = submission_id and (
      (select status from daily_rounds dr where dr.id = s.round_id) = 'closed'
      or user_has_participated(s.round_id, auth.uid())
    )
  )
);
create policy subm_media_insert_author on submission_media for insert with check (
  exists (select 1 from submissions s where s.id = submission_id and s.author_id = auth.uid())
);

-- comments
create policy comments_select_visibility on comments for select using (
  (select status from daily_rounds dr where dr.id = round_id) = 'closed'
  or user_has_participated(round_id, auth.uid())
);
create policy comments_insert_member_open on comments for insert with check (
  exists (select 1 from group_members gm where gm.group_id = round_group_id(round_id) and gm.user_id = auth.uid() and gm.status='active')
  and (select status from daily_rounds dr where dr.id = round_id) <> 'closed'
);
create policy comments_update_author_before_close on comments for update using (
  author_id = auth.uid() and (select status from daily_rounds dr where dr.id = round_id) <> 'closed'
) with check (author_id = auth.uid());
create policy comments_soft_delete_admin on comments for update using (
  is_group_admin(round_group_id(round_id), auth.uid())
) with check (true);

-- round_votes
create policy votes_select_visibility on round_votes for select using (
  (select status from daily_rounds dr where dr.id = round_id) = 'closed'
  or user_has_participated(round_id, auth.uid())
);
create policy votes_insert_member_open on round_votes for insert with check (
  exists (select 1 from group_members gm where gm.group_id = round_group_id(round_id) and gm.user_id = auth.uid() and gm.status='active')
  and (select status from daily_rounds dr where dr.id = round_id) = 'open'
);

-- notifications
create policy notifications_select_self on notifications for select using (user_id = auth.uid());

-- user_devices
create policy user_devices_self_select on user_devices for select using (user_id = auth.uid());
create policy user_devices_self_upsert on user_devices for insert with check (user_id = auth.uid());
create policy user_devices_self_update on user_devices for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_devices_self_delete on user_devices for delete using (user_id = auth.uid());

-- user_group_prefs
create policy ugp_self_select on user_group_prefs for select using (user_id = auth.uid());
create policy ugp_self_upsert on user_group_prefs for insert with check (
  user_id = auth.uid() and exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
);
create policy ugp_self_update on user_group_prefs for update using (user_id = auth.uid());
create policy ugp_self_delete on user_group_prefs for delete using (user_id = auth.uid());

-- group_ownership_transfers
create policy got_select_actors on group_ownership_transfers for select using (
  from_user_id = auth.uid() or to_user_id = auth.uid()
);
create policy got_insert_owner on group_ownership_transfers for insert with check (
  exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid() and gm.role='owner' and gm.status='active')
);
create policy got_update_recipient on group_ownership_transfers for update using (
  to_user_id = auth.uid()
) with check (to_user_id = auth.uid());

COMMIT;

