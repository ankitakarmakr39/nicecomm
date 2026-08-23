import React, { useState } from "react";
import "./Settings.css";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("profile");

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [notifications, setNotifications] = useState({
        email: true,
        order: true,
        support: true
    });

    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();

        alert("Profile settings saved successfully!");
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();

        alert("Password change request submitted!");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
    };

    return (
        <div className="settings-page">

            <div className="settings-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account and preferences</p>
                </div>
            </div>

            <div className="settings-container">

                {/* SIDEBAR */}

                <div className="settings-sidebar">

                    <button
                        className={activeTab === "profile" ? "active" : ""}
                        onClick={() => setActiveTab("profile")}
                    >
                        👤 Profile
                    </button>

                    <button
                        className={activeTab === "security" ? "active" : ""}
                        onClick={() => setActiveTab("security")}
                    >
                        🔒 Security
                    </button>

                    <button
                        className={activeTab === "notifications" ? "active" : ""}
                        onClick={() => setActiveTab("notifications")}
                    >
                        🔔 Notifications
                    </button>

                    <button
                        className={activeTab === "account" ? "active" : ""}
                        onClick={() => setActiveTab("account")}
                    >
                        ⚙️ Account
                    </button>

                </div>


                {/* CONTENT */}

                <div className="settings-content">

                    {/* PROFILE */}

                    {activeTab === "profile" && (
                        <div className="settings-section">

                            <h2>Profile Settings</h2>
                            <p>Update your personal information.</p>

                            <form onSubmit={handleSaveProfile}>

                                <div className="settings-form-group">
                                    <label>Full Name</label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="settings-form-group">
                                    <label>Email Address</label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="settings-form-group">
                                    <label>Phone Number</label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                >
                                    Save Changes
                                </button>

                            </form>

                        </div>
                    )}


                    {/* SECURITY */}

                    {activeTab === "security" && (
                        <div className="settings-section">

                            <h2>Security</h2>
                            <p>Manage your account password.</p>

                            <form onSubmit={handlePasswordChange}>

                                <div className="settings-form-group">
                                    <label>Current Password</label>

                                    <input
                                        type="password"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="settings-form-group">
                                    <label>New Password</label>

                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="settings-form-group">
                                    <label>Confirm New Password</label>

                                    <input
                                        type="password"
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                >
                                    Change Password
                                </button>

                            </form>

                        </div>
                    )}


                    {/* NOTIFICATIONS */}

                    {activeTab === "notifications" && (
                        <div className="settings-section">

                            <h2>Notifications</h2>
                            <p>Choose which notifications you want to receive.</p>

                            <div className="notification-item">

                                <div>
                                    <strong>Email Notifications</strong>
                                    <span>
                                        Receive important account updates.
                                    </span>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            email: e.target.checked
                                        })
                                    }
                                />

                            </div>


                            <div className="notification-item">

                                <div>
                                    <strong>Order Notifications</strong>
                                    <span>
                                        Get updates about your orders.
                                    </span>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={notifications.order}
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            order: e.target.checked
                                        })
                                    }
                                />

                            </div>


                            <div className="notification-item">

                                <div>
                                    <strong>Support Notifications</strong>
                                    <span>
                                        Receive support ticket updates.
                                    </span>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={notifications.support}
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            support: e.target.checked
                                        })
                                    }
                                />

                            </div>

                            <button
                                className="settings-save-btn"
                                onClick={() =>
                                    alert("Notification preferences saved!")
                                }
                            >
                                Save Preferences
                            </button>

                        </div>
                    )}


                    {/* ACCOUNT */}

                    {activeTab === "account" && (
                        <div className="settings-section">

                            <h2>Account</h2>
                            <p>Manage your NiceComm account.</p>

                            <div className="account-danger-box">

                                <h3>Logout</h3>

                                <p>
                                    Sign out from your current NiceComm account.
                                </p>

                                <button
                                    className="logout-btn"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default Settings;