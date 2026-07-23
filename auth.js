/**
 * SolarClean AI - Authentication & Multi-Tenant User Data Manager
 * Handles Email/Password Authentication, User Registration, Session Storage, and Scoped Data Persistence.
 */

window.SolarAuthModule = (function () {

  const STORAGE_KEY_USERS = 'solarclean_users_db';
  const STORAGE_KEY_SESSION = 'solarclean_current_session';

  // Pre-configured Default Demo Accounts
  const DEFAULT_USERS = {
    'admin@solarclean.ai': {
      id: 'usr_admin',
      email: 'admin@solarclean.ai',
      password: 'solar123',
      name: 'Dr. Sarah Connor',
      role: 'Solar Farm Operations Lead',
      profileKey: 'sahara-50mw'
    },
    'rooftop@california.com': {
      id: 'usr_rooftop',
      email: 'rooftop@california.com',
      password: 'solar123',
      name: 'Marcus Vance',
      role: 'Commercial Facility Manager',
      profileKey: 'california-250kw'
    },
    'homeowner@bavaria.de': {
      id: 'usr_bavaria',
      email: 'homeowner@bavaria.de',
      password: 'solar123',
      name: 'Klaus Mueller',
      role: 'Residential Solar Owner',
      profileKey: 'bavaria-12kw'
    }
  };

  // Initialize Local User Database
  function getUsersDB() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory user DB');
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  function saveUsersDB(db) {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(db));
    } catch (e) {
      console.warn('Could not save user DB to localStorage');
    }
  }

  // Get Currently Logged In Session
  function getCurrentUser() {
    try {
      const storedSession = sessionStorage.getItem(STORAGE_KEY_SESSION) || localStorage.getItem(STORAGE_KEY_SESSION);
      if (storedSession) {
        return JSON.parse(storedSession);
      }
    } catch (e) {
      console.warn('Error reading session');
    }
    // Default to admin user if no session
    return DEFAULT_USERS['admin@solarclean.ai'];
  }

  // Login Function
  function login(email, password, rememberMe = true) {
    const db = getUsersDB();
    const cleanEmail = email.toLowerCase().trim();

    if (!db[cleanEmail]) {
      return { success: false, message: 'User account not found. Please check your email or Sign Up.' };
    }

    const user = db[cleanEmail];
    if (user.password !== password) {
      return { success: false, message: 'Invalid password. Please try again.' };
    }

    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profileKey: user.profileKey
    };

    try {
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
      }
    } catch (e) {}

    return { success: true, user: sessionData };
  }

  // Register Function
  function register(fullName, email, password, arrayCapacityKw, arrayLocation) {
    const db = getUsersDB();
    const cleanEmail = email.toLowerCase().trim();

    if (db[cleanEmail]) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const customProfileKey = `custom_${Date.now()}`;
    const capacityNum = parseFloat(arrayCapacityKw) || 100;

    // Register dynamic site profile into Simulator profiles
    if (window.SolarDataSimulator) {
      const profiles = window.SolarDataSimulator.getProfiles();
      profiles[customProfileKey] = {
        id: customProfileKey,
        name: `${fullName}'s Array (${capacityNum} kW)`,
        location: arrayLocation || 'Custom Site',
        lat: 36.778,
        lon: -119.417,
        capacityKw: capacityNum,
        baseEfficiency: 20.5,
        soilingRatePerDay: 0.45,
        rainCleaningThreshold: 4.0,
        tariffPerKwh: 0.15,
        washCostPerClean: capacityNum > 500 ? 500 : 120,
        waterLitresPerClean: Math.round(capacityNum * 2.5)
      };
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      password: password,
      name: fullName,
      role: 'Solar System Operator',
      profileKey: customProfileKey
    };

    db[cleanEmail] = newUser;
    saveUsersDB(db);

    // Auto login
    login(cleanEmail, password, true);
    return { success: true, user: newUser };
  }

  // Logout Function
  function logout() {
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (e) {}
  }

  return {
    getCurrentUser,
    login,
    register,
    logout,
    getUsersDB
  };

})();
