-- Create User table (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Group table
CREATE TABLE IF NOT EXISTS public."Group" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'FRIENDS',
    "imageUrl" TEXT,
    "dailyHour" INTEGER,
    "dailyMinute" INTEGER,
    "maxMembers" INTEGER,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "deletedAt" TIMESTAMPTZ,
    "ownerId" UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create GroupMembership table
CREATE TABLE IF NOT EXISTS public."GroupMembership" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL DEFAULT 'MEMBER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    nickname TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "userId" UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    "groupId" UUID NOT NULL REFERENCES public."Group"(id) ON DELETE CASCADE,
    UNIQUE("userId", "groupId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_owner_id ON public."Group"("ownerId");
CREATE INDEX IF NOT EXISTS idx_group_code ON public."Group"(code);
CREATE INDEX IF NOT EXISTS idx_group_deleted_at ON public."Group"("deletedAt");
CREATE INDEX IF NOT EXISTS idx_group_membership_user_id ON public."GroupMembership"("userId");
CREATE INDEX IF NOT EXISTS idx_group_membership_group_id ON public."GroupMembership"("groupId");
CREATE INDEX IF NOT EXISTS idx_group_membership_status ON public."GroupMembership"(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GroupMembership" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for Group
CREATE POLICY "Groups are viewable by members" ON public."Group"
    FOR SELECT USING (
        auth.uid() = "ownerId" OR
        EXISTS (
            SELECT 1 FROM public."GroupMembership" 
            WHERE "groupId" = id AND "userId" = auth.uid() AND status = 'ACTIVE'
        )
    );

CREATE POLICY "Users can create groups" ON public."Group"
    FOR INSERT WITH CHECK (auth.uid() = "ownerId");

CREATE POLICY "Group owners can update their groups" ON public."Group"
    FOR UPDATE USING (auth.uid() = "ownerId");

CREATE POLICY "Group owners can delete their groups" ON public."Group"
    FOR DELETE USING (auth.uid() = "ownerId");

-- Create RLS policies for GroupMembership
CREATE POLICY "Group memberships are viewable by group members" ON public."GroupMembership"
    FOR SELECT USING (
        auth.uid() = "userId" OR
        EXISTS (
            SELECT 1 FROM public."Group" 
            WHERE id = "groupId" AND "ownerId" = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public."GroupMembership" gm
            WHERE gm."groupId" = "groupId" AND gm."userId" = auth.uid() AND gm.status = 'ACTIVE'
        )
    );

CREATE POLICY "Users can join groups" ON public."GroupMembership"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own membership" ON public."GroupMembership"
    FOR UPDATE USING (auth.uid() = "userId");

CREATE POLICY "Group owners can manage memberships" ON public."GroupMembership"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public."Group" 
            WHERE id = "groupId" AND "ownerId" = auth.uid()
        )
    );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
