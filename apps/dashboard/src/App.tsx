import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

interface User {
  display_id: string;
  email: string;
  role: string;
}

interface GetUsersData {
  users: User[];
}

const GET_USERS = gql`
  query GetUsers {
    users {
      display_id
      email
      role
    }
  }
`;

function App() {
  const { loading, error, data } = useQuery<GetUsersData>(GET_USERS);

  return (
    <div className="min-h-screen bg-bg-secondary p-8 font-sans">
      <div className="card mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              User Management
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Manage your team and permissions
            </p>
          </div>
          <button className="btn-primary">+ Add New User</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card">
          <div className="metric-label">Total Users</div>
          <div className="metric-value">{data?.users?.length || 0}</div>
          <div className="metric-change positive">↑ 12% this month</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Creators</div>
          <div className="metric-value">5</div>
          <div className="metric-change text-text-secondary">No change</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending Approvals</div>
          <div className="metric-value text-warning">3</div>
          <div className="metric-change negative">Requires attention</div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="header">
          <h3 className="text-lg font-semibold text-text-primary">All Users</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-secondary">
            Loading users...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-danger">
            Error: {error.message}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((user: User) => (
                <tr key={user.display_id}>
                  <td className="font-mono text-primary font-medium">
                    {user.display_id}
                  </td>
                  <td className="text-text-primary">{user.email}</td>
                  <td>
                    <span className="badge badge-primary">{user.role}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
