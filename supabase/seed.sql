-- Seed minimal pour le dev local
insert into prompt_tags (id, name, category)
values
  (gen_random_uuid(), 'friends', 'audience')
on conflict do nothing;

