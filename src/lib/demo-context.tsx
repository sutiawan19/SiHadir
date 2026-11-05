"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type DemoRole = "mahasiswa" | "pj" | "dosen" | "kaprodi" | "baak";

export interface DemoUser {
  id: string;
  nama: string;
  email: string;
  role: DemoRole;
  roleLabel: string;
  avatar: string;
  identitas: string; // NIM atau NIDN atau NIP
  prodi?: string;
  initials: string;
}

export const DEMO_USERS: Record<DemoRole, DemoUser> = {
  mahasiswa: {
    id: "mhs-1",
    nama: "Sutiawan",
    email: "sutiawan@student.unsap.ac.id",
    role: "mahasiswa",
    roleLabel: "Mahasiswa",
    avatar: "/avatar.png",
    identitas: "NIM 20220810001",
    prodi: "Teknik Informatika",
    initials: "SU",
  },
  pj: {
    id: "pj-1",
    nama: "Rizky Maulana",
    email: "rizky.maulana@student.unsap.ac.id",
    role: "pj",
    roleLabel: "PJ Mata Kuliah (TI-3A)",
    avatar: "/avatar.png",
    identitas: "NIM 20220810005",
    prodi: "Teknik Informatika",
    initials: "RM",
  },
  dosen: {
    id: "dsn-1",
    nama: "Agun Guntara, S.Kom., M.Kom",
    email: "agun.guntara@unsap.ac.id",
    role: "dosen",
    roleLabel: "Dosen Pengampu",
    avatar: "/beranda-hero.png",
    identitas: "NIDN 0412088901",
    prodi: "Teknik Informatika",
    initials: "AG",
  },
  kaprodi: {
    id: "kpr-1",
    nama: "Dr. Siti Rahayu, M.Kom",
    email: "siti.rahayu@unsap.ac.id",
    role: "kaprodi",
    roleLabel: "Kaprodi Teknik Informatika",
    avatar: "/avatar.png",
    identitas: "NIDN 0405067802",
    prodi: "Teknik Informatika",
    initials: "SR",
  },
  baak: {
    id: "bak-1",
    nama: "Admin BAAK UNSAP",
    email: "baak@unsap.ac.id",
    role: "baak",
    roleLabel: "Bagian Akademik & Kemahasiswaan",
    avatar: "/avatar.png",
    identitas: "NIP 198503152010121002",
    prodi: "Biro Akademik UNSAP",
    initials: "BA",
  },
};

interface DemoContextType {
  currentUser: DemoUser;
  setCurrentRole: (role: DemoRole) => void;
  loginAs: (role: DemoRole) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<DemoRole>("mahasiswa");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const router = useRouter();

  // Load from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("sihadir_demo_role") as DemoRole;
      const savedAuth = localStorage.getItem("sihadir_demo_logged_in");
      if (savedRole && DEMO_USERS[savedRole]) {
        setCurrentRoleState(savedRole);
      }
      if (savedAuth !== null) {
        setIsLoggedIn(savedAuth === "true");
      }
    }
  }, []);

  const setCurrentRole = (role: DemoRole) => {
    setCurrentRoleState(role);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("sihadir_demo_role", role);
      localStorage.setItem("sihadir_demo_logged_in", "true");
    }
  };

  const loginAs = (role: DemoRole) => {
    setCurrentRole(role);
    switch (role) {
      case "mahasiswa":
        router.push("/beranda");
        break;
      case "pj":
        router.push("/pj");
        break;
      case "dosen":
        router.push("/dosen");
        break;
      case "kaprodi":
        router.push("/kaprodi");
        break;
      case "baak":
        router.push("/baak");
        break;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("sihadir_demo_logged_in", "false");
    }
    router.push("/login");
  };

  const currentUser = DEMO_USERS[currentRole] || DEMO_USERS.mahasiswa;

  return (
    <DemoContext.Provider
      value={{
        currentUser,
        setCurrentRole,
        loginAs,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}

