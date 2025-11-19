import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Update role
  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingId(userId);

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });

      // Update UI instantly
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#0F8A69] mb-6">Manage Users</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-t-green-500 border-gray-300 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-[#0F8A69] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-center">Actions</th>
                <th className="py-3 px-4 text-center"></th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">
                      {user.firstName} {user.lastName}
                    </td>

                    <td className="py-3 px-4">{user.email}</td>

                    <td className="py-3 px-4 capitalize">{user.role}</td>

                    {/* Role Selector */}
                    <td className="py-3 px-4 text-center">
                      <select
                        className="px-3 py-1 border rounded-lg"
                        value={user.role}
                        disabled={savingId === user.id}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                      >
                        <option value="user">User</option>
                        <option value="health worker">Health Worker</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>

                    {/* NEW FIXED-WIDTH STATUS COLUMN */}
                    <td className="py-3 px-4 text-center w-24">
                      {savingId === user.id ? (
                        <span className="text-green-500 animate-pulse">
                          Saving...
                        </span>
                      ) : (
                        <span className="opacity-0">Saving...</span>
                        // Invisible placeholder, keeps same width
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
