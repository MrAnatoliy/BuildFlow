const formatUserName = (fullName) => {
    if (!fullName) return "Unknown";

    const parts = fullName.trim().split(/[\s-]+/);

    if (parts.length === 1) return parts[0];

    const firstName = parts[0];
    const lastNameInitial = parts[parts.length - 1].charAt(0).toUpperCase();

    return `${firstName} ${lastNameInitial}.`;
};

export default formatUserName