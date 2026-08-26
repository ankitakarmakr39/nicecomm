import React, { useEffect, useState } from "react";
import "./Settings.css";

const API_BASE_URL = "http://localhost:5000/api";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("profile");

    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        phone: ""
    });

    const [password, setPassword] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [notifications, setNotifications] = useState({
        email: true,
        order: true,
        support: true
    });

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const [profileError, setProfileError] = useState("");
    const [passwordError, setPasswordError] = useState("");


    // =====================================================
    // GET PROFILE
    // =====================================================

    const fetchProfile = async () => {
        try {
            setLoadingProfile(true);
            setProfileError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setProfileError("Please login first.");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/settings/profile`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch profile"
                );
            }

            setProfile({
                full_name: data.user.full_name || "",
                email: data.user.email || "",
                phone: data.user.phone || ""
            });

        } catch (error) {
            console.error("Fetch Profile Error:", error);

            setProfileError(
                error.message || "Failed to load profile"
            );

        } finally {
            setLoadingProfile(false);
        }
    };


    // =====================================================
    // LOAD PROFILE WHEN SETTINGS PAGE OPENS
    // =====================================================

    useEffect(() => {
        fetchProfile();
    }, []);


    // =====================================================
    // PROFILE INPUT CHANGE
    // =====================================================

    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            setSavingProfile(true);
            setProfileMessage("");
            setProfileError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setProfileError("Please login first.");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/settings/profile`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        full_name: profile.full_name,
                        email: profile.email,
                        phone: profile.phone
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update profile"
                );
            }

            setProfile({
                full_name: data.user.full_name || "",
                email: data.user.email || "",
                phone: data.user.phone || ""
            });

            // Update stored user information if present
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);

                    const updatedUser = {
                        ...user,
                        full_name: data.user.full_name,
                        email: data.user.email,
                        phone: data.user.phone
                    };

                    localStorage.setItem(
                        "user",
                        JSON.stringify(updatedUser)
                    );

                } catch (error) {
                    console.log("User localStorage update skipped");
                }
            }

            setProfileMessage(
                data.message || "Profile Updated Successfully"
            );

        } catch (error) {
            console.error("Update Profile Error:", error);

            setProfileError(
                error.message || "Failed to update profile"
            );

        } finally {
            setSavingProfile(false);
        }
    };


    // =====================================================
    // PASSWORD INPUT CHANGE
    // =====================================================

    const handlePasswordChangeInput = (e) => {
        setPassword({
            ...password,
            [e.target.name]: e.target.value
        });
    };


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (!password.current_password) {
            setPasswordError("Current password is required.");
            return;
        }

        if (!password.new_password) {
            setPasswordError("New password is required.");
            return;
        }

        if (
            password.new_password !==
            password.confirm_password
        ) {
            setPasswordError(
                "New password and confirm password do not match."
            );
            return;
        }

        try {
            setChangingPassword(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setPasswordError("Please login first.");
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/settings/password`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        current_password:
                            password.current_password,

                        new_password:
                            password.new_password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to change password"
                );
            }

            // If backend returns a new JWT token,
            // save the new token.
            if (data.token) {
                localStorage.setItem(
                    "token",
                    data.token
                );
            }

            setPassword({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });

            setPasswordMessage(
                data.message ||
                "Password Changed Successfully"
            );

        } catch (error) {
            console.error(
                "Change Password Error:",
                error
            );

            setPasswordError(
                error.message ||
                "Failed to change password"
            );

        } finally {
            setChangingPassword(false);
        }
    };


    // =====================================================
    // LOGOUT
    // =====================================================

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
                    <p>
                        Manage your account and preferences
                    </p>
                </div>
            </div>


            <div className="settings-container">


                {/* SIDEBAR */}

                <div className="settings-sidebar">

                    <button
                        className={
                            activeTab === "profile"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("profile")
                        }
                    >
                        👤 Profile
                    </button>


                    <button
                        className={
                            activeTab === "security"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("security")
                        }
                    >
                        🔒 Security
                    </button>


                    <button
                        className={
                            activeTab === "notifications"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("notifications")
                        }
                    >
                        🔔 Notifications
                    </button>


                    <button
                        className={
                            activeTab === "account"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("account")
                        }
                    >
                        ⚙️ Account
                    </button>

                </div>


                {/* CONTENT */}

                <div className="settings-content">


                    {/* =================================================
                        PROFILE
                    ================================================= */}

                    {activeTab === "profile" && (

                        <div className="settings-section">

                            <h2>Profile Settings</h2>

                            <p>
                                Update your personal information.
                            </p>


                            {loadingProfile && (
                                <p>
                                    Loading profile...
                                </p>
                            )}


                            {profileError && (
                                <p className="settings-error">
                                    {profileError}
                                </p>
                            )}


                            {profileMessage && (
                                <p className="settings-success">
                                    {profileMessage}
                                </p>
                            )}


                            <form
                                onSubmit={
                                    handleSaveProfile
                                }
                            >


                                <div className="settings-form-group">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="full_name"
                                        value={
                                            profile.full_name
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter your full name"
                                    />

                                </div>


                                <div className="settings-form-group">

                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            profile.email
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter your email"
                                    />

                                </div>


                                <div className="settings-form-group">

                                    <label>
                                        Phone Number
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            profile.phone
                                        }
                                        onChange={
                                            handleProfileChange
                                        }
                                        placeholder="Enter your phone number"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                    disabled={savingProfile}
                                >
                                    {savingProfile
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </form>

                        </div>
                    )}


                    {/* =================================================
                        SECURITY
                    ================================================= */}

                    {activeTab === "security" && (

                        <div className="settings-section">

                            <h2>Security</h2>

                            <p>
                                Manage your account password.
                            </p>


                            {passwordError && (
                                <p className="settings-error">
                                    {passwordError}
                                </p>
                            )}


                            {passwordMessage && (
                                <p className="settings-success">
                                    {passwordMessage}
                                </p>
                            )}


                            <form
                                onSubmit={
                                    handlePasswordChange
                                }
                            >


                                <div className="settings-form-group">

                                    <label>
                                        Current Password
                                    </label>

                                    <input
                                        type="password"
                                        name="current_password"
                                        value={
                                            password.current_password
                                        }
                                        onChange={
                                            handlePasswordChangeInput
                                        }
                                        placeholder="Enter current password"
                                    />

                                </div>


                                <div className="settings-form-group">

                                    <label>
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        name="new_password"
                                        value={
                                            password.new_password
                                        }
                                        onChange={
                                            handlePasswordChangeInput
                                        }
                                        placeholder="Enter new password"
                                    />

                                </div>


                                <div className="settings-form-group">

                                    <label>
                                        Confirm New Password
                                    </label>

                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={
                                            password.confirm_password
                                        }
                                        onChange={
                                            handlePasswordChangeInput
                                        }
                                        placeholder="Confirm new password"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="settings-save-btn"
                                    disabled={changingPassword}
                                >
                                    {changingPassword
                                        ? "Changing..."
                                        : "Change Password"}
                                </button>

                            </form>

                        </div>
                    )}


                    {/* =================================================
                        NOTIFICATIONS
                    ================================================= */}

                    {activeTab === "notifications" && (

                        <div className="settings-section">

                            <h2>Notifications</h2>

                            <p>
                                Choose which notifications you want
                                to receive.
                            </p>


                            <div className="notification-item">

                                <div>
                                    <strong>
                                        Email Notifications
                                    </strong>

                                    <span>
                                        Receive important account updates.
                                    </span>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={
                                        notifications.email
                                    }
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            email:
                                                e.target.checked
                                        })
                                    }
                                />

                            </div>


                            <div className="notification-item">

                                <div>
                                    <strong>
                                        Order Notifications
                                    </strong>

                                    <span>
                                        Get updates about your orders.
                                    </span>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={
                                        notifications.order
                                    }
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            order:
                                                e.target.checked
                                        })
                                    }
                                />

                            </div>


                            <div className="notification-item">

                                <div>
                                    <strong>
                                        Support Notifications
                                    </strong>

                                    <span>
                                        Receive support ticket updates.
                                    </span>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={
                                        notifications.support
                                    }
                                    onChange={(e) =>
                                        setNotifications({
                                            ...notifications,
                                            support:
                                                e.target.checked
                                        })
                                    }
                                />

                            </div>


                            <button
                                className="settings-save-btn"
                                onClick={() =>
                                    alert(
                                        "Notification preferences saved!"
                                    )
                                }
                            >
                                Save Preferences
                            </button>

                        </div>
                    )}


                    {/* =================================================
                        ACCOUNT
                    ================================================= */}

                    {activeTab === "account" && (

                        <div className="settings-section">

                            <h2>Account</h2>

                            <p>
                                Manage your NiceComm account.
                            </p>


                            <div className="account-danger-box">

                                <h3>Logout</h3>

                                <p>
                                    Sign out from your current
                                    NiceComm account.
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