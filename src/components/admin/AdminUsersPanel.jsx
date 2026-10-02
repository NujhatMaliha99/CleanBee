import React, { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function AdminUsersPanel({ users = [], onUpdateUserStatus }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.phone || "").toLowerCase().includes(term);

    const matchesRole = roleFilter === "all" ? true : (u.role || "user") === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-panel-container">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Registered Users & Roles</h2>
          <p className="panel-subtitle">Manage system user accounts, volunteer privileges, and active statuses</p>
        </div>
        <span className="panel-count-badge">{filteredUsers.length} Users</span>
      </div>

      <div className="admin-filters-container">
        <div className="admin-filters-grid">
          <div className="admin-filter-item search-item">
            <label className="filter-label">Search User</label>
            <input
              type="text"
              className="admin-input search-input"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-item">
            <label className="filter-label">Role</label>
            <select
              className="admin-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Name & Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr key={u.id} className="admin-table-row">
                <td>#{u.id}</td>
                <td>
                  <div className="table-user-cell">
                    <span className="user-name">{u.name}</span>
                    <span className="user-email">{u.email} • {u.phone || "No phone"}</span>
                  </div>
                </td>
                <td>
                  <span className={`role-pill role-${u.role || "user"}`}>
                    {u.role ? u.role.toUpperCase() : "USER"}
                  </span>
                </td>
                <td>
                  <StatusBadge status={u.status || "active"} />
                </td>
                <td>{u.joinedDate || "Oct 2026"}</td>
                <td>
                  <button
                    type="button"
                    className={`admin-btn ${u.status === "suspended" ? "admin-btn-success" : "admin-btn-danger"} btn-xs`}
                    onClick={() =>
                      onUpdateUserStatus(u, u.status === "suspended" ? "active" : "suspended")
                    }
                  >
                    {u.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="admin-btn admin-btn-ghost btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-ghost btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
