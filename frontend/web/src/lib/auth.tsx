import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
// Firebase Imports
import {
	User as FirebaseUser,
	AuthError as FirebaseAuthError,
	createUserWithEmailAndPassword, // Will be used later
	signInWithEmailAndPassword, // Will be used later
	signInWithRedirect, // Will be used later
	GoogleAuthProvider, // Will be used later
	signOut as firebaseSignOut, // Will be used later
	sendPasswordResetEmail, // Will be used later
	updateProfile, // Will be used later
	updatePassword as firebaseUpdatePassword, // Will be used later
	onAuthStateChanged,
	UserCredential, // Type for sign-in/sign-up results
} from "firebase/auth";
import { auth } from "./firebase"; // Import initialized Firebase auth instance
// API and Type Imports
import { OrganizationMembersAPI } from "@/api";
import { OrganizationMember } from "@/api/types";

// Updated interface for Firebase
interface AuthContextType {
	user: FirebaseUser | null;
	currentMembership: OrganizationMember | null; // Added membership state
	isLoading: boolean; // Initial auth check loading
	isMembershipLoading: boolean; // Loading state for membership data
	// --- Updated Function Signatures (Placeholders for now) ---
	signUp: (
		email: string,
		password: string,
		profileData?: { firstName?: string; lastName?: string }
	) => Promise<UserCredential>; // More specific profile data
	signIn: (email: string, password: string) => Promise<UserCredential>;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
	updateUserProfile: (profileData: {
		displayName?: string | null;
		photoURL?: string | null;
	}) => Promise<void>;
	updatePassword: (password: string) => Promise<void>;
	// --- End Updated Function Signatures ---
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [currentMembership, setCurrentMembership] =
		useState<OrganizationMember | null>(null);
	const [isLoading, setIsLoading] = useState(true); // For initial auth state check
	const [isMembershipLoading, setIsMembershipLoading] = useState(true); // For membership fetch

	useEffect(() => {
		// Set up Firebase auth state listener
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			console.log(
				"Firebase Auth state changed, user:",
				currentUser ? currentUser.uid : null
			);
			setUser(currentUser);
			setIsLoading(false); // Initial auth check done

			if (currentUser) {
				setIsMembershipLoading(true);
				// Attempt to get active org ID from localStorage
				const activeOrgId = localStorage.getItem("activeOrganizationId");
				console.log("Found activeOrgId in localStorage:", activeOrgId);

				if (activeOrgId) {
					try {
						const membership = await OrganizationMembersAPI.getByUserIdAndOrgId(
							currentUser.uid,
							activeOrgId
						);
						setCurrentMembership(membership); // Will be null if not found
						console.log("Fetched membership:", membership);
					} catch (error) {
						console.error("Error fetching organization membership:", error);
						setCurrentMembership(null); // Set to null on error
					}
				} else {
					// No active org selected yet
					console.log("No active organization ID found in localStorage.");
					setCurrentMembership(null);
				}
				setIsMembershipLoading(false);
			} else {
				// User logged out
				setCurrentMembership(null);
				setIsMembershipLoading(false); // Not loading if no user
			}
		});

		// Cleanup subscription on unmount
		return () => {
			unsubscribe();
		};
	}, []); // Empty dependency array ensures this runs only once on mount

	// --- Firebase Auth Method Implementations ---
	const signUp = async (
		email: string,
		password: string,
		profileData?: { firstName?: string; lastName?: string }
	): Promise<UserCredential> => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			// Optionally update profile immediately after signup
			if (userCredential.user && profileData) {
				const displayName = [profileData.firstName, profileData.lastName]
					.filter(Boolean)
					.join(" ")
					.trim();
				console.log("Constructed displayName:", displayName);

				if (displayName) {
					console.log("Updating profile with displayName...");
					await updateProfile(userCredential.user, {
						displayName: displayName,
					});
					// Update local user state if needed, though onAuthStateChanged might handle it
					setUser({ ...userCredential.user, displayName });
				}
			}
			return userCredential;
		} catch (error) {
			console.error("Firebase signUp error:", error);
			// Consider mapping Firebase errors to user-friendly messages
			throw error;
		}
	};

	const signIn = async (
		email: string,
		password: string
	): Promise<UserCredential> => {
		try {
			return await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error("Firebase signIn error:", error);
			throw error;
		}
	};

	const signInWithGoogle = async (): Promise<void> => {
		try {
			const provider = new GoogleAuthProvider();
			// Using redirect flow
			await signInWithRedirect(auth, provider);
			// No return needed here, Firebase handles the redirect and auth state change
		} catch (error) {
			console.error("Firebase signInWithGoogle error:", error);
			throw error;
		}
	};

	const signOut = async (): Promise<void> => {
		try {
			return await firebaseSignOut(auth);
		} catch (error) {
			console.error("Firebase signOut error:", error);
			throw error;
		}
	};

	const resetPassword = async (email: string): Promise<void> => {
		try {
			const actionCodeSettings = {
				// URL to redirect back to after password reset
				url: `${window.location.origin}/login?passwordReset=true`, // Example redirect
				handleCodeInApp: true,
			};
			return await sendPasswordResetEmail(auth, email, actionCodeSettings);
		} catch (error) {
			console.error("Firebase resetPassword error:", error);
			throw error;
		}
	};

	const updateUserProfile = async (profileData: {
		displayName?: string | null;
		photoURL?: string | null;
	}): Promise<void> => {
		if (!auth.currentUser) {
			throw new Error("User not logged in to update profile.");
		}
		try {
			await updateProfile(auth.currentUser, profileData);
			// Manually update local state as updateProfile doesn't trigger onAuthStateChanged
			const updatedUser = { ...auth.currentUser, ...profileData };
			// We need to cast because TS doesn't know currentUser is not null here
			setUser(updatedUser as FirebaseUser);
			console.log(
				"User profile updated locally and in Firebase. New state:",
				updatedUser
			);
		} catch (error) {
			console.error("Firebase updateUserProfile error:", error);
			throw error;
		}
	};

	const updatePassword = async (password: string): Promise<void> => {
		if (!auth.currentUser) {
			throw new Error("User not logged in to update password.");
		}
		try {
			// Note: This often requires recent re-authentication for security reasons.
			// The UI calling this might need to handle re-authentication flows.
			return await firebaseUpdatePassword(auth.currentUser, password);
		} catch (error) {
			console.error("Firebase updatePassword error:", error);
			throw error;
		}
	};
	// --- End Firebase Auth Method Implementations ---

	const value = {
		user,
		currentMembership, // Added
		isLoading,
		isMembershipLoading, // Added
		signUp,
		signIn,
		signInWithGoogle,
		signOut,
		resetPassword,
		updateUserProfile,
		updatePassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
