import React, { useState } from "react";
import {
  User,
  Mail,
  ArrowLeft,
  Edit,
  Save,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useUpdateUser, useLogout } from "../authentication/authHooks";
import { toast } from "react-hot-toast";
import supabase from "../services/supabaseClient";

const Profile = () => {
  const { user, isLoading: userLoading } = useUser();
  const { updateUser, isUpdating } = useUpdateUser();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize nickname when user data loads
  React.useEffect(() => {
    if (user) {
      setNickname(user.nickname || "");
    }
  }, [user]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateUser({ nickname });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmInput !== user.nickname) {
      toast.error("Nickname doesn't match");
      return;
    }

    try {
      setIsDeleting(true);

      // First, delete user's novels and related data
      const { data: userNovels, error: novelsError } = await supabase
        .from("novels")
        .select("id")
        .eq("author_id", user.id);

      if (novelsError) throw new Error(novelsError.message);

      // Delete chapters for each novel
      if (userNovels.length > 0) {
        const novelIds = userNovels.map((novel) => novel.id);
        const { error: chaptersError } = await supabase
          .from("chapters")
          .delete()
          .in("novel_id", novelIds);

        if (chaptersError) throw new Error(chaptersError.message);

        // Delete novels
        const { error: deleteNovelsError } = await supabase
          .from("novels")
          .delete()
          .eq("author_id", user.id);

        if (deleteNovelsError) throw new Error(deleteNovelsError.message);
      }

      // Delete user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw new Error(profileError.message);

      // Finally delete the user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (authError) throw new Error(authError.message);

      toast.success("Account deleted successfully");
      logout();
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-2" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            to="/browse"
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Browse
          </Link>
        </div>

        <div className="bg-base-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-5">
              <User size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Profile</h1>
              <p className="opacity-70">Manage your personal information</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="bg-base-100 rounded-lg p-6">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-4">
                    <label
                      htmlFor="nickname"
                      className="block text-sm font-medium mb-2"
                    >
                      Nickname
                    </label>
                    <input
                      id="nickname"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setNickname(user.nickname || "");
                      }}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="btn btn-primary"
                    >
                      {isUpdating ? (
                        <>
                          <Loader size={16} className="animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                      <User size={18} className="opacity-70" />
                      <span className="font-medium">Nickname</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="mr-3">{user.nickname || "Not set"}</span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-base-300 rounded-md transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={18} className="opacity-70" />
                    <span className="font-medium">Email</span>
                    <span className="ml-auto">{user.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Management */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Management</h2>
            <div className="bg-base-100 rounded-lg p-6 space-y-6">
              <div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full sm:w-auto"
                >
                  Sign Out
                </button>
              </div>

              <div className="pt-4 border-t border-base-300">
                <h3 className="text-lg font-medium text-error mb-2">
                  Danger Zone
                </h3>
                <p className="mb-3 text-sm opacity-70">
                  Once you delete your account, there is no going back. All your
                  data will be permanently removed.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-error btn-outline"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-base-100 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center text-error mb-4">
              <AlertTriangle size={24} className="mr-2" />
              <h3 className="text-xl font-bold">Delete Account</h3>
            </div>
            <p className="mb-4">
              This action is irreversible. All your novels, chapters, and
              profile information will be permanently deleted.
            </p>
            <p className="mb-6 text-sm">
              To confirm, please type your nickname:{" "}
              <strong>{user.nickname}</strong>
            </p>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-error mb-4"
              placeholder="Enter your nickname"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                disabled={isDeleting || deleteConfirmInput !== user.nickname}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
