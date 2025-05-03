import supabase from "./supabaseClient";

export async function signup({ nickname, email, password, role }) {
  // Check if user already exists
  const { data: users, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (users && users.length > 0) {
    throw new Error("Email already registered");
  }

  // Ensure role is one of the allowed values based on the constraint
  // ((role = ANY (ARRAY['normal'::text, 'admin'::text])))
  const validRoles = ["normal", "admin"];
  const safeRole = validRoles.includes(role) ? role : "normal";

  // First create the user in auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        role: safeRole,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Make sure we have a user before trying to create a profile
  if (data && data.user) {
    // Insert into profiles table - ensure all required fields are included
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: email,
      nickname: nickname,
      role: safeRole, // Use the validated role value
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Consider deleting the auth user if profile creation fails
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }
  }

  return data;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) throw new Error(profileError.message);

  return { ...profile, user: data.user }; // Combine user info
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getUserrole() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) throw new Error(profileError.message);

  return profile.role;
}

export async function updateCurrentUser({ password, nickname }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (password) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });
    if (passwordError) throw new Error(passwordError.message);
  }

  if (nickname) {
    const { error: nicknameError } = await supabase
      .from("profiles")
      .update({ nickname: nickname })
      .eq("id", user.id);
    if (nicknameError) throw new Error(nicknameError.message);
  }

  return await getCurrentUser();
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`, // Change to a dedicated callback route
    },
  });

  if (error) throw new Error(error.message);
  return data;
}

// Add this new function to handle the callback after Google authentication
export async function handleAuthCallback() {
  const { data: authData } = await supabase.auth.getSession();

  if (!authData.session) {
    throw new Error("No authenticated session found");
  }

  const { data: userData } = await supabase.auth.getUser();

  if (userData?.user) {
    // Create or update profile for the Google user
    await createUserProfileIfNeeded(userData.user);
  }

  return userData;
}

export async function createUserProfileIfNeeded(user) {
  if (!user) return;

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (existingProfile) return;

  // Create profile if it doesn't exist
  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    nickname: user.user_metadata.full_name || user.email.split("@")[0],
    role: "normal",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }
}
