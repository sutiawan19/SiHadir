"use client";

import {
  Buildings,
  CalendarBlank,
  ClipboardText,
  GraduationCap,
  House,
  MapPin,
  PencilSimple,
  SquaresFour,
  UserCircle,
  UsersThree,
  WarningCircle,
} from "@phosphor-icons/react";
import type { NavItem } from "@/components/BottomNav";

export const mahasiswaNav: NavItem[] = [
  { href: "/beranda", label: "Beranda", icon: House },
  { href: "/kehadiran", label: "Kehadiran", icon: PencilSimple },
  { href: "/profil", label: "Profil", icon: UserCircle },
];

export const dosenNav: NavItem[] = [
  { href: "#dasbor", label: "Dasbor", icon: SquaresFour },
  { href: "#kelas", label: "Kelas", icon: GraduationCap },
  { href: "#ews", label: "EWS", icon: WarningCircle },
];

export const pjNav: NavItem[] = [
  { href: "/beranda", label: "Beranda", icon: House },
  { href: "/kehadiran", label: "Kehadiran", icon: PencilSimple },
  { href: "/pj", label: "PJ", icon: ClipboardText },
  { href: "/profil", label: "Profil", icon: UserCircle },
];

export const kaprodiNav: NavItem[] = [
  { href: "#dasbor", label: "Dasbor", icon: SquaresFour },
  { href: "#kelas", label: "Kelas", icon: UsersThree },
  { href: "#ews", label: "EWS", icon: WarningCircle },
];

export const baakNav: NavItem[] = [
  { href: "#gedung", label: "Gedung", icon: Buildings },
  { href: "#jadwal", label: "Jadwal", icon: CalendarBlank },
  { href: "#radius", label: "Radius", icon: MapPin },
];
