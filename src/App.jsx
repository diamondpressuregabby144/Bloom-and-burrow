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
    { name: "EWG-Verified Diapers", tags: ["organic", "EWG verified"], site
