import { useState, useEffect, useMemo } from "react";
import {
  Heart, ShoppingBag, Sparkles, ClipboardList, Home, Plus, X, ExternalLink,
  Search, Trash2, User, LogOut, MapPin, Star, Phone, Navigation, CheckCircle2, Clock
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { CARE_PROVIDERS, haversineMiles, mapsDirectionsUrl } from "./careProviders";

const COLORS = {
  bg: "#F4F1E6", surface: "#FFFFFF", ink: "#26302A",
  forest: "#2F4538", ochre: "#C98A3E", mauve: "#9C6B7A", line: "#E3DECE",
};

const CATEGORIES = [
  { id: "sleep", label: "Sleep & Bassinet", need: "You need a bassinet", icon: "🛏️" },
  { id: "diapering", label: "Diapering", need: "You need diapers", icon: "🧷" },
  { id: "feeding", label: "Feeding & Formula", need: "You need feeding supplies", icon: "🍼" },
  { id: "clothing", label: "Clothing", need: "You need onesies & layers", icon: "👕" },
  { id: "bathing", label: "Bath & Skin", need: "You need bath basics", icon: "🛁" },
  { id: "transport", label: "Car Seat & Stroller", need: "You need a car seat", icon: "🚼" },
  { id: "health", label: "Health & Nursery Safety", need: "You need a thermometer & monitor", icon: "🩺" },
  { id: "toys", label: "Toys & Development", need: "You need first toys", icon: "🧸" },
  { id: "momrecovery", label: "Mom Recovery", need: "You need postpartum care items", icon: "🌸" },
  { id: "feeding-mom", label: "Nursing & Pumping", need: "You need nursing gear", icon: "🤱" },
];

const REGISTRY_ITEMS = {
  sleep: [
    { name: "Organic Cotton Bassinet Sheet Set", tags: ["organic", "GOTS cotton"], site: "Burt's Bees Baby", url: "https://www.burtsbeesbaby.com/" },
    { name: "Non-Toxic Foam Bassinet Mattress", tags: ["low-chemical", "CertiPUR"], site: "Newton Baby", url: "https://www.newtonbaby.com/" },
    { name: "Smart Bassinet (Snoo)", tags: ["new", "premium"], site: "Happiest Baby", url: "https://www.happiestbaby.com/" },
  ],
  diapering: [
    { name: "Plant-Based Diapers, fragrance-free", tags: ["organic", "chlorine-free"], site: "Coterie", url: "https://www.coterie.com/" },
    { name: "EWG-Verified Diapers", tags: ["organic", "EWG verified"], site: "Healthybaby", url: "https://healthybaby.com/" },
    { name: "Bamboo Compostable Diapers", tags: ["organic", "compostable"], site: "Dyper", url: "https://dyper.com/" },
    { name: "Plant-Derived Diapers", tags: ["low-chemical"], site: "Hello Bello", url: "https://hellobello.com/" },
  ],
  feeding: [
    { name: "Organic Baby Food Pouches", tags: ["organic", "USDA organic"], site: "Once Upon a Farm", url: "https://onceuponafarmorganics.com/" },
    { name: "Clean-Ingredient Purees", tags: ["organic"], site: "Serenity Kids", url: "https://serenitykids.com/" },
    { name: "Glass Baby Bottles", tags: ["low-chemical", "BPA-free"], site: "Dr. Brown's", url: "https://www.drbrownsbaby.com/" },
    { name: "Pantry Organic Formula & Snacks", tags: ["organic"], site: "Thrive Market", url: "https://thrivemarket.com/" },
  ],
  clothing: [
    { name: "GOTS Organic Cotton Layette", tags: ["organic", "GOTS"], site: "Hanna Andersson", url: "https://www.hannaandersson.com/" },
    { name: "Bamboo Viscose Sleepers", tags: ["low-chemical", "OEKO-TEX"], site: "Kyte Baby", url: "https://kytebaby.com/" },
    { name: "Organic Cotton Basics", tags: ["organic"], site: "Monica + Andy", url: "https://www.monicaandandy.com/" },
  ],
  bathing: [
    { name: "Fragrance-Free Baby Wash", tags: ["low-chemical", "EWG verified"], site: "Healthybaby", url: "https://healthybaby.com/" },
    { name: "Organic Baby Lotion", tags: ["organic"], site: "Burt's Bees Baby", url: "https://www.burtsbeesbaby.com/" },
  ],
  transport: [
    { name: "Flame-Retardant-Free Car Seat", tags: ["low-chemical"], site: "Nuna", url: "https://www.nunababy.com/" },
    { name: "Lightweight Everyday Stroller", tags: ["new"], site: "UPPAbaby", url: "https://www.uppababy.com/" },
  ],
  health: [
    { name: "No-Touch Thermometer", tags: ["new"], site: "Babylist Registry", url: "https://www.babylist.com/" },
    { name: "Video Monitor", tags: ["new"], site: "Nanit", url: "https://www.nanit.com/" },
  ],
  toys: [
    { name: "Untreated Wood & Organic Fabric Toys", tags: ["organic", "low-chemical"], site: "Monica + Andy", url: "https://www.monicaandandy.com/" },
    { name: "Registry-Popular First Toys", tags: ["new"], site: "Babylist", url: "https://www.babylist.com/" },
  ],
  momrecovery: [
    { name: "Organic Cotton Postpartum Pads", tags: ["organic"], site: "Rael", url: "https://www.getrael.com/" },
    { name: "Fragrance-Free Perineal Care", tags: ["low-chemical"], site: "Frida Mom", url: "https://www.fridamom.com/" },
  ],
  "feeding-mom": [
    { name: "Silicone Nursing Pads", tags: ["low-chemical", "BPA-free"], site: "Haakaa", url: "https://haakaa.com/" },
    { name: "Hospital-Grade Pump", tags: ["new"], site: "Spectra Baby USA", url: "https://spectrababyusa.com/" },
  ],
};

const MILESTONE_GROUPS = [
  { id: "feeding", label: "Feeding", items: ["Establish feeding routine", "Introduce solids", "Track ounces/day"] },
  { id: "sleep", label: "Sleep", items: ["Bassinet in room", "Move to crib", "Drop a nap"] },
  { id: "diapering", label: "Diapering", items: ["Stock size 1", "Size-up check", "Start potty awareness"] },
  { id: "growth", label: "Growth & Health", items: ["2-week checkup", "2-month vaccines", "Weight/length log"] },
  { id: "development", label: "Development", items: ["Tummy time daily", "First smile", "Rolling over"] },
  { id: "bonding", label: "Bonding", items: ["Skin-to-skin", "Reading together", "Babywearing"] },
  { id: "momrecovery", label: "Mom Recovery", items: ["6-week checkup", "Pelvic floor check-in", "Rest & hydration"] },
  { id: "gear", label: "Gear Setup", items: ["Car seat installed", "Nursery baby-proofed", "Outlets covered"] },
];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function Tag({ children, tone = "ochre" }) {
  const bg = tone === "ochre" ? "#F3E3C8" : tone === "mauve" ? "#EFE0E4" : "#DEE7DE";
  const fg = tone === "ochre" ? "#8A5E1F" : tone === "mauve" ? "#7A4B58" : "#2F4538";
  return (
    <span style={{ background: bg, color: fg, fontFamily: "'IBM Plex Mono', monospace" }}
      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full">{children}</span>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <div style={{ color: COLORS.ochre, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs uppercase tracking-widest mb-1">{eyebrow}</div>
      <h2 style={{ color: COLORS.forest, fontFamily: "'Fraunces', serif" }} className="text-2xl font-semibold">{title}</h2>
    </div>
  );
}
