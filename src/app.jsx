import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Brain,
  CalendarDays,
  Check,
  Home,
  Sparkles,
} from "lucide-react";

const COLORS = {
  home: {
    bg: "#E8DDCC",
    bgGlow1: "rgba(221,168,164,.28)",
    bgGlow2: "rgba(201,114,27,.18)",
    title: "#0D5B3E",
    card: "#F7F1E8",
    card2: "#EFE4D4",
    border: "#C9A978",
    accent: "#C9721B",
    progress: "#DDA8A4",
    textMuted: "#7A6A58",
  },
  today: {
    bg: "#F1E6DA",
    bgGlow1: "rgba(201,114,27,.16)",
    bgGlow2: "rgba(221,168,164,.22)",
    title: "#C9721B",
    card: "#FFF8EF",
    card2: "#F3E3D2",
    border: "#DDA8A4",
    accent: "#0D5B3E",
    progress: "#DDA8A4",
    textMuted: "#7A6A58",
  },
  history: {
    bg: "#E5D6BF",
    bgGlow1: "rgba(217,182,46,.20)",
    bgGlow2: "rgba(201,114,27,.14)",
    title: "#D9B62E",
    card: "#F8EFE0",
    card2: "#EFE1C8",
    border: "#C9721B",
    accent: "#0D5B3E",
    progress: "#D9B62E",
    textMuted: "#746550",
  },
  intel: {
    bg: "#DDE5D8",
    bgGlow1: "rgba(13,91,62,.16)",
    bgGlow2: "rgba(221,168,164,.14)",
    title: "#0D5B3E",
    card: "#F6F4EA",
    card2: "#E4EBDD",
    border: "#8AA68A",
    accent: "#C9721B",
    progress: "#0D5B3E",
    textMuted: "#5E6B5B",
  },
};

const CORE_SECTIONS = ["Plan", "Body", "Home", "Projects", "Nutrition", "Family", "Reset"];

const SECTION_COLORS = {
  Plan: "#C9721B",
  Body: "#0D5B3E",
  Home: "#DDA8A4",
  Projects: "#D9B62E",
  Nutrition: "#8AA68A",
  Family: "#C9721B",
  Reset: "#7A6A58",
};

const CORE_HABITS = [
  { id: "planToday", label: "Create Today’s Plan", points: 10, group: "Plan" },
  { id: "movement", label: "Morning Walk / Movement", points: 10, group: "Body" },
  { id: "completeProject", label: "Complete One Started Project", points: 10, group: "Projects" },

  { id: "morningReset", label: "Morning Reset Routine", points: 8, group: "Home" },
  { id: "eatIntentional", label: "Eat Intentionally", points: 8, group: "Nutrition" },
  { id: "kidConnection", label: "Intentional Kid Connection", points: 8, group: "Family" },

  { id: "homeReset", label: "15-Minute Home Reset", points: 5, group: "Home" },
  { id: "eveningReset", label: "Evening Reset / Prep Tomorrow", points: 5, group: "Reset" },
  { id: "pauseReset", label: "Pause & Reset", points: 5, group: "Family" },
];

const BONUS_HABITS = [
  { id: "mealPrep", label: "Meal Prep / Healthy Snacks", points: 5 },
  { id: "creativeProject", label: "Creative Home Project Progress", points: 5 },
  { id: "outsideKids", label: "Outside Time With Kids", points: 5 },
  { id: "extraMovement", label: "Extra Movement Session", points: 3 },
  { id: "declutter", label: "Declutter One Small Space", points: 3 },
];

const MAX_CORE_POINTS = 69;
const STORAGE_KEY = "calm-complete-v1";

const TIER_MESSAGES = {
  stable: [
  "You Did Enough To Keep Momentum Alive. Stack Enough Of These And Your Life Changes.",
  "Motivation Didn’t Save You Today. Standards Did.",
  "Nobody Talks About This Part. The Quiet Reps Are What Build People.",
  "A focused fool can accomplish more than a distracted genius.",
  "Repetition is the mother of mastery.",
  "Your actions reflect your priorities.",
  "Nobody is coming to save you.",
  "You’re not overwhelmed. You’re under-prioritized.",
  "You Protected The Standard Today.",
  "Most people don’t fail because they’re not capable; they fail because they’re not consistent.",
  "You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.",
],
elite: [
  "Separation Starts Here.",
  "The people who win are the ones who’re willing to do the work long after others have stopped.",
  "You Didn’t Just Survive The Day. You Drove It.",
  "This Is Where Confidence Actually Comes From. Kept Promises.",
  "When You’re Tired And Still Execute, That’s Who You Really Are.",
  "Don't stop when you're tired. Stop when you're done.",
  "Real Confidence Comes From Evidence.",
  "There is no better way to grow as a person than do everyday something you hate.",
],
overdrive: [
  "Very Few People Operate Here Consistently.",
  "The more you do, the more you can do.",
  "Your future is built by the choices you make when no one is watching.",
  "This Is What Full Alignment Feels Like.",
  "Days Like This Change Trajectories.",
  "Most People Negotiate With Themselves All Day. You Didn’t.",
],
};

function playSound(type = "click") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === "click") {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(2600, now);
      osc.connect(gain);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.03);
      return;
    }

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(type === "overdrive" ? 160 : 220, now);
    osc.frequency.exponentialRampToValueAtTime(
      type === "overdrive" ? 360 : type === "elite" ? 520 : 420,
      now + 0.08
    );

    osc.connect(gain);

    const volume =
      type === "overdrive" ? 0.12 : type === "elite" ? 0.09 : 0.07;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {}
}

function todayKey() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function shiftDate(dateKey, days) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function monthDays(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  const y = d.getFullYear();
  const m = d.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  const blanks = Array.from({ length: first.getDay() }, () => null);

  const days = Array.from({ length: last.getDate() }, (_, i) => {
    const day = new Date(y, m, i + 1);
    day.setMinutes(day.getMinutes() - day.getTimezoneOffset());
    return day.toISOString().slice(0, 10);
  });

  return [...blanks, ...days];
}

function monthKey(dateKey) {
  return dateKey.slice(0, 7);
}

function monthLabel(month) {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

function defaultDay() {
  return { core: {}, bonus: {}, closed: false };
}

function isPastDate(dateKey) {
  return dateKey < todayKey();
}

function shouldCountDay(dayKey, dayData) {
  if (!dayData) return false;

  const isToday = dayKey === todayKey();

  if (isToday && !dayData.closed) {
    return false;
  }

  return true;
}
function completionFor(day) {
  const safeDay = day || defaultDay();

  const core = CORE_HABITS.reduce(
    (sum, h) => sum + (safeDay.core?.[h.id] ? h.points : 0),
    0
  );

  const bonus = BONUS_HABITS.reduce(
    (sum, h) => sum + (safeDay.bonus?.[h.id] ? h.points : 0),
    0
  );

  return {
    core,
    bonus,
    total: core + bonus,
    corePercent: Math.round((core / MAX_CORE_POINTS) * 100),
    totalPercent: Math.round(((core + bonus) / MAX_CORE_POINTS) * 100),
  };
}

function getTier(score) {
  if (score.totalPercent >= 109) {
    return { label: "Overdrive Day", color: "#b8860b", key: "overdrive" };
  }

  if (score.corePercent >= 85) {
    return { label: "Elite Day", color: "#22c55e", key: "elite" };
  }

  if (score.corePercent >= 55) {
    return { label: "Stable Day", color: "#fb923c", key: "stable" };
  }

  return { label: "Drift Day", color: "#ef4444", key: "drift" };
}

  if (score.corePercent >= 85) {
    return { label: "Elite Day", color: "#22c55e", key: "elite" };
  }

  if (score.corePercent >= 55) {
    return { label: "Stable Day", color: "#fb923c", key: "stable" };
  }

  return { label: "Drift Day", color: "#ef4444", key: "drift" };
}

function getNextMove(day, score) {
  if (score.corePercent >= 55) return "Momentum Stable. Protect Family And Bedtime.";

  const open = CORE_HABITS.filter((h) => !day?.core?.[h.id]);
  const body = open.find((h) => h.group === "Body");
  const family = open.find((h) => h.group === "Family");
  const focus = open.find((h) => h.group === "Focus");
  const nutrition = open.find((h) => h.group === "Nutrition");
  const picks = [body, family, focus, nutrition].filter(Boolean).slice(0, 2);

  if (!picks.length) return `${60 - score.core} Core Points To Stabilize The Day.`;
  return picks.map((p) => p.label).join(" + ");
}

function getHeatClass(dayKey, day) {
  if (!shouldCountDay(dayKey, day)) {
    return "bg-[#102338] text-[#86a7c2]";
  }

  const score = completionFor(day);

  if (score.totalPercent >= 109) return "bg-[#b8860b] text-white";
  if (score.corePercent >= 85) return "bg-emerald-400/70 text-[#07111f]";
  if (score.corePercent >= 55) return "bg-[#fb923c]/75 text-[#07111f]";
  return "bg-red-500/25 text-slate-200";
}

function getRandomMessage(tierKey) {
  const messages = TIER_MESSAGES[tierKey] || [];
  if (!messages.length) return "";
  return messages[Math.floor(Math.random() * messages.length)];
}

function getSectionScore(day, section) {
  const habits = CORE_HABITS.filter((h) => h.group === section);
  const earned = habits.reduce(
    (sum, h) => sum + (day.core?.[h.id] ? h.points : 0),
    0
  );
  const max = habits.reduce((sum, h) => sum + h.points, 0);
  const percent = max ? Math.round((earned / max) * 100) : 0;

  return { earned, max, percent };
}

function monthlyStats(data, targetMonth) {
  const keys = Object.keys(data).filter(
  (k) => monthKey(k) === targetMonth && shouldCountDay(k, data[k])
);

  if (!keys.length) {
    return {
      month: targetMonth,
      avg: 0,
      drift: 0,
      stable: 0,
      elite: 0,
      overdrive: 0,
      bestStreak: 0,
      days: 0,
    };
  }

  let drift = 0;
  let stable = 0;
  let elite = 0;
  let overdrive = 0;
  let totalPct = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  keys.sort().forEach((k) => {
    const score = completionFor(data[k]);
    totalPct += score.totalPercent;

    if (score.totalPercent >= 109) overdrive += 1;
    else if (score.corePercent >= 85) elite += 1;
    else if (score.corePercent >= 55) stable += 1;
    else drift += 1;

    if (score.corePercent >= 55) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return {
    month: targetMonth,
    avg: Math.round(totalPct / keys.length),
    drift,
    stable,
    elite,
    overdrive,
    bestStreak,
    days: keys.length,
  };
}

function allTimeStats(data) {
  const keys = Object.keys(data).filter((k) => shouldCountDay(k, data[k]));
  return keys.reduce(
    (acc, k) => {
      const score = completionFor(data[k]);

      if (score.totalPercent >= 109) acc.overdrive += 1;
      else if (score.corePercent >= 85) acc.elite += 1;
      else if (score.corePercent >= 55) acc.stable += 1;
      else acc.drift += 1;

      return acc;
    },
    { drift: 0, stable: 0, elite: 0, overdrive: 0 }
  );
}

function ProgressRing({ score }) {
  const clamped = Math.max(0, Math.min(100, score.corePercent));
  const tier = getTier(score);

  return (
    <div
      className="relative mx-auto grid h-44 w-44 place-items-center rounded-full shadow-[0_0_55px_rgba(123,175,212,.18)]"
      style={{
        background: `conic-gradient(${tier.color} ${
          clamped * 3.6
        }deg, rgba(255,255,255,.08) 0deg)`,
      }}
    >
      <div className="absolute inset-3 rounded-full border border-[#1d3a55] bg-[#07111f]" />

      <div className="relative text-center">
        <div className="text-4xl font-black tracking-tight text-white">
          {score.core}
        </div>

        <div className="text-xs font-semibold text-[#9fb7cc]">
          / 110 Points
        </div>

        <div className="mt-1 text-xs font-black" style={{ color: tier.color }}>
          {tier.label}
        </div>
      </div>
    </div>
  );
}

function XpBurst({ burst }) {
  return (
    <AnimatePresence>
      {burst && (
        <motion.div
          key={burst.id}
          initial={{ opacity: 0, y: 10, scale: 0.85 }}
          animate={{ opacity: 1, y: -44, scale: 1 }}
          exit={{ opacity: 0, y: -74, scale: 0.95 }}
          transition={{ duration: 0.75 }}
          className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 rounded-2xl border border-[#ffd84d]/40 bg-[#ffd84d]/15 px-5 py-3 text-2xl font-black text-[#fff0a8] shadow-[0_0_45px_rgba(255,216,77,.25)] backdrop-blur"
        >
          +{burst.points} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TierPopup({ popup, onClose }) {
  return (
    <AnimatePresence>
      {popup && (
        <>
          <motion.div
            key={`${popup.id}-flash`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: popup.color }}
          />

          <motion.div
            key={popup.id}
            initial={{ opacity: 0, scale: 0.75, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.45 }}
            className="fixed left-1/2 top-1/2 z-50 w-[86%] max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="rounded-[2rem] border-2 px-7 py-7 text-center shadow-2xl backdrop-blur-xl"
              style={{
                backgroundColor: "rgba(7,17,31,.96)",
                borderColor: popup.color,
                boxShadow: `0 0 55px ${popup.color}55`,
              }}
            >
              <div
                className="text-4xl font-black tracking-tight"
                style={{ color: popup.color }}
              >
                {popup.label}
              </div>

              <p className="mt-4 text-sm font-bold leading-6 text-slate-100">
                {popup.message}
              </p>

              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onClose();
                }}
                className="mt-6 w-full rounded-2xl border border-[#7BAFD4]/30 bg-[#102f4a] px-4 py-3 text-sm font-black text-[#7BAFD4]"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SectionProgress({ section, day }) {
  const { earned, max, percent } = getSectionScore(day, section);
  const color = SECTION_COLORS[section] || COLORS.today.progress;

  return (
    <div className="mb-2 rounded-2xl border border-white/10 bg-white/[.035] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-widest text-white/80">
          {section}
        </div>

        <div className="text-xs font-black text-white">
          {earned}/{max}
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
        <motion.div
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.35 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function HabitRow({
  habit,
  checked,
  locked = false,
  disabled = false,
  onToggle,
  bonus = false,
  theme = "dark",
}) {
  const isDisabled = locked || disabled;

  const base =
    theme === "today"
      ? "flex w-full items-center gap-3 border-b border-[#103b40]/70 px-3 py-4 text-left last:border-b-0"
      : theme === "intel"
      ? "flex w-full items-center gap-3 border-b border-[#3a3a3a] px-3 py-4 text-left last:border-b-0"
      : "flex w-full items-center gap-3 border-b border-[#1d3a55]/70 px-3 py-4 text-left last:border-b-0";

  const circle = checked
    ? "border-emerald-300 bg-emerald-400 text-[#07111f]"
    : theme === "today"
    ? "border-[#00B2A9]/40 bg-[#123236]"
    : theme === "intel"
    ? "border-[#BF5700]/40 bg-[#202020]"
    : "border-[#315b7a] bg-[#102338]";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      onClick={() => !isDisabled && onToggle(habit)}
      className={`${base} ${isDisabled ? "opacity-30" : ""}`}
    >
      <div className={`grid h-7 w-7 place-items-center rounded-full border ${circle}`}>
        {checked && <Check size={17} strokeWidth={4} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-bold text-slate-100">{habit.label}</div>
          {bonus && <Sparkles size={14} className="text-[#ffd84d]" />}
        </div>

        {!bonus && <div className="text-xs text-white/55">{habit.group}</div>}
      </div>

      <div className="font-black text-[#ffd84d]">+{habit.points}</div>
    </motion.button>
  );
}

function Stat({ label, value, theme = "home" }) {
  const cls =
    theme === "history"
      ? "rounded-2xl border border-[#E56020]/30 bg-[#1D1160]/70 p-3 text-center"
      : theme === "intel"
      ? "rounded-2xl border border-[#BF5700]/30 bg-[#171717] p-3 text-center"
      : "rounded-2xl border border-[#1d3a55] bg-[#102338] p-3 text-center shadow-[0_0_25px_rgba(0,0,0,.28)]";

  return (
    <div className={cls}>
      <div className="text-2xl font-black text-white">{value}</div>

      <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-white/55">
        {label}
      </div>
    </div>
  );
}

const NAV_STYLES = {
  home: "bg-[#102f4a] text-[#7BAFD4] shadow-[0_0_18px_rgba(123,175,212,.18)]",
  today: "bg-[#0f3b3f] text-[#00B2A9] shadow-[0_0_18px_rgba(0,178,169,.18)]",
  history: "bg-[#2b145d] text-[#F9A01B] shadow-[0_0_18px_rgba(249,160,27,.18)]",
  insights: "bg-[#2a1a10] text-[#BF5700] shadow-[0_0_18px_rgba(191,87,0,.18)]",
};

function NavButton({ active, onClick, icon, label, tabKey }) {
  return (
    <button
      type="button"
      onClick={() => {
        playSound("click");
        onClick();
      }}
      className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-black transition ${
        active ? NAV_STYLES[tabKey] : "text-[#6f8ba3]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MonthlyBar({ month }) {
  const width = Math.max(0, Math.min(135, month.avg));

  return (
    <div className="rounded-2xl border border-[#E56020]/25 bg-[#1D1160]/65 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-black text-white">{monthLabel(month.month)}</div>
        <div className="text-xs font-black text-[#F9A01B]">{month.avg}%</div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-black/25">
        <div
          className="h-full rounded-full bg-[#E56020]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function LifeScoreboard() {
  const [date, setDate] = useState(todayKey());
  const [tab, setTab] = useState("home");
  const [data, setData] = useState({});
  const [burst, setBurst] = useState(null);
  const [tierPopup, setTierPopup] = useState(null);
  const [triggeredTiers, setTriggeredTiers] = useState([]);

  useEffect(() => {
    try {
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const closedPastDays = { ...loaded };

      Object.keys(closedPastDays).forEach((key) => {
        if (isPastDate(key) && !closedPastDays[key]?.closed) {
          closedPastDays[key] = {
            ...defaultDay(),
            ...closedPastDays[key],
            closed: true,
          };
        }
      });

      setData(closedPastDays);
    } catch {
      setData({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    setTriggeredTiers([]);
  }, [date]);

  const rawDay = data[date] || defaultDay();
  const day = isPastDate(date) && !rawDay.closed ? { ...rawDay, closed: true } : rawDay;

  const score = completionFor(day);
  const loggedKeys = Object.keys(data)   .filter((k) => shouldCountDay(k, data[k]))   .sort();
  const selectedMonth = monthKey(date);
  const thisMonthStats = monthlyStats(data, selectedMonth);
  const totals = allTimeStats(data);

  const stats = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => shiftDate(todayKey(), i - 6));

    const avg =
      last7.reduce((sum, k) => sum + completionFor(data[k]).totalPercent, 0) / 7;

    let streak = 0;
    let cursor = shouldCountDay(todayKey(), data[todayKey()])   ? todayKey()   : shiftDate(todayKey(), -1);

    while (completionFor(data[cursor]).corePercent >= 55) {
      streak += 1;
      cursor = shiftDate(cursor, -1);
    }

    const wins = loggedKeys.filter((k) => completionFor(data[k]).corePercent >= 55).length;

    const bestStreak = loggedKeys.reduce(
      (acc, k) => {
        const win = completionFor(data[k]).corePercent >= 55;
        const cur = win ? acc.cur + 1 : 0;

        return { cur, best: Math.max(acc.best, cur) };
      },
      { cur: 0, best: 0 }
    ).best;

    return { avg: Math.round(avg), streak, wins, bestStreak };
  }, [data, loggedKeys.length]);

  const insights = useMemo(() => {
    if (!loggedKeys.length) return ["No Pattern Yet. Log A Few Days First."];

    const rates = CORE_HABITS.map((h) => {
      const done = loggedKeys.filter((k) => data[k]?.core?.[h.id]).length;

      return {
        ...h,
        rate: Math.round((done / loggedKeys.length) * 100),
      };
    }).sort((a, b) => a.rate - b.rate);

    const rows = [];

    if (stats.avg < 60) {
      rows.push(
        "Drift Detected: 7-Day Average Is Below 60%. Tighten The Floor Before Adding More."
      );
    }

    if ((rates.find((h) => h.id === "bed")?.rate ?? 100) < 50) {
      rows.push("Bedtime Is Weak. That Usually Taxes Tomorrow Before It Starts.");
    }

    if ((rates.find((h) => h.id === "screen")?.rate ?? 100) < 50) {
      rows.push("Phone Control Is Dragging Momentum. This Is A Leverage Point.");
    }

    const familyIds = ["phoneFamily", "school", "sports"];
    const familyRate = Math.round(
      familyIds.reduce(
        (sum, id) => sum + (rates.find((h) => h.id === id)?.rate || 0),
        0
      ) / familyIds.length
    );

    if (familyRate < 60) {
      rows.push("Family Presence Is Leaking. Keep The Windows Smaller And More Protected.");
    }

    rows.push(`Weakest Habit: ${rates[0].label} (${rates[0].rate}%).`);
    rows.push(
      `Strongest Habit: ${rates[rates.length - 1].label} (${
        rates[rates.length - 1].rate
      }%).`
    );

    return rows;
  }, [data, loggedKeys.length, stats.avg]);

  const monthlyComparison = useMemo(() => {
    const months = [   ...new Set(     Object.keys(data)       .filter((k) => shouldCountDay(k, data[k]))       .map(monthKey)   ), ]   .sort()   .reverse();
    return months.map((m) => monthlyStats(data, m));
  }, [data]);

  function updateDay(updater) {
    setData((prev) => {
      const current = prev[date] || defaultDay();

      return {
        ...prev,
        [date]: updater(current),
      };
    });
  }

  function triggerBurst(points) {
    const id = Date.now();

    setBurst({ id, points });

    setTimeout(() => {
      setBurst((b) => (b?.id === id ? null : b));
    }, 700);
  }

  function triggerTier(updatedScore) {
    const tier = getTier(updatedScore);

    if (tier.key === "drift") return;
    if (triggeredTiers.includes(tier.key)) return;

    setTriggeredTiers((prev) => [...prev, tier.key]);

    playSound("pop");

    const id = Date.now();

    setTierPopup({
      id,
      label: tier.label,
      color: tier.color,
      key: tier.key,
      message: getRandomMessage(tier.key),
    });
  }

  function toggleCore(habit) {
    if (day.closed) return;

    playSound("click");

    const currently = Boolean(day.core?.[habit.id]);

    const updatedCore = {
      ...day.core,
      [habit.id]: !currently,
    };

    const simulatedDay = {
      ...day,
      core: updatedCore,
    };

    const updatedScore = completionFor(simulatedDay);

    updateDay((d) => ({
      ...d,
      core: updatedCore,
    }));

    if (!currently) {
      playSound("pop");
      triggerBurst(habit.points);
      triggerTier(updatedScore);
    }
  }

  function toggleBonus(habit) {
    if (day.closed) return;

    playSound("click");

    const currently = Boolean(day.bonus?.[habit.id]);

    const updatedBonus = {
      ...day.bonus,
      [habit.id]: !currently,
    };

    const simulatedDay = {
      ...day,
      bonus: updatedBonus,
    };

    const updatedScore = completionFor(simulatedDay);

    updateDay((d) => ({
      ...d,
      bonus: updatedBonus,
    }));

    if (!currently) {
      playSound("pop");
      triggerBurst(habit.points);
      triggerTier(updatedScore);
    }
  }

  function toggleCloseDay() {
    playSound("click");

    updateDay((d) => ({
      ...d,
      closed: !d.closed,
    }));
  }

  function openHistoryDay(dayKey) {
    playSound("click");
    setDate(dayKey);
    setTab("today");
  }

  const bonusUnlocked = score.corePercent >= 85;

  const availableBonus = BONUS_HABITS.map((h) => ({
    ...h,
    locked: !bonusUnlocked,
  }));

  const last7 = Array.from({ length: 7 }, (_, i) => shiftDate(todayKey(), i - 6));

  const familyScore = ["phoneFamily", "school", "sports"].reduce(
    (sum, id) =>
      sum +
      (day.core?.[id]
        ? CORE_HABITS.find((h) => h.id === id)?.points || 0
        : 0),
    0
  );

  const appBg =
    tab === "today"
      ? `min-h-screen bg-[${COLORS.today.bg}] bg-[radial-gradient(circle_at_15%_10%,${COLORS.today.bgGlow1},transparent_28%),radial-gradient(circle_at_88%_18%,${COLORS.today.bgGlow2},transparent_30%)] px-4 pb-28 pt-5 text-slate-100`
      : tab === "history"
      ? `min-h-screen bg-[${COLORS.history.bg}] bg-[radial-gradient(circle_at_20%_10%,${COLORS.history.bgGlow1},transparent_28%),radial-gradient(circle_at_85%_18%,${COLORS.history.bgGlow2},transparent_30%)] px-4 pb-28 pt-5 text-slate-100`
      : tab === "insights"
      ? `min-h-screen bg-[${COLORS.intel.bg}] bg-[radial-gradient(circle_at_18%_10%,${COLORS.intel.bgGlow1},transparent_28%)] px-4 pb-28 pt-5 text-slate-100`
      : `min-h-screen bg-[${COLORS.home.bg}] bg-[radial-gradient(circle_at_15%_10%,${COLORS.home.bgGlow1},transparent_28%),radial-gradient(circle_at_88%_18%,${COLORS.home.bgGlow2},transparent_30%)] px-4 pb-28 pt-5 text-slate-100`;

  return (
    <div className={appBg}>
      <XpBurst burst={burst} />
      <TierPopup popup={tierPopup} onClose={() => setTierPopup(null)} />

      <div className="mx-auto max-w-md">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-4xl font-black tracking-tighter"
              style={{
                color:
                  tab === "today"
                    ? COLORS.today.title
                    : tab === "history"
                    ? COLORS.history.title
                    : tab === "insights"
                    ? COLORS.intel.title
                    : COLORS.home.title,
              }}
            >
              Calm & Complete
            </h1>

            <p className="mt-1 text-sm text-white/55">
              Calm routines. Finished days.
            </p>
          </div>

          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="max-w-[142px] rounded-2xl border border-white/15 bg-black/20 px-3 py-2 text-sm font-bold text-slate-100 outline-none"
          />
        </header>

        {tab === "home" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section className="rounded-[2rem] border border-[#1d3a55] bg-[#0d1b2a]/95 p-5 shadow-2xl shadow-black/30">
              <ProgressRing score={score} />

              <div className="mt-5 text-center">
                <div className="text-6xl font-black tracking-tighter text-white">
                  {score.totalPercent}%
                </div>

                <div className="mt-1 text-sm text-[#9fb7cc]">XP Percentage</div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat label="Current Streak" value={stats.streak} />
                <Stat   label="Stable+ This Month"   value={thisMonthStats.stable + thisMonthStats.elite + thisMonthStats.overdrive} />
                <Stat label="Month Avg XP" value={`${thisMonthStats.avg}%`} />
              </div>

              <div className="mt-4 rounded-2xl border border-[#ff8a3d]/30 bg-[#ff8a3d]/15 p-3 text-sm font-bold text-[#ffd6b9]">
                Today&apos;s Next Move: {getNextMove(day, score)}
              </div>
            </section>

            <section className="mt-4 rounded-[1.7rem] border border-[#1d3a55] bg-[#0d1b2a]/95 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-black text-[#7BAFD4]">Family</div>
                  <div className="text-xs text-[#86a7c2]">Priority #1</div>
                </div>

                <div className="font-black text-[#ffd84d]">{familyScore}/20</div>
              </div>

              <div className="grid gap-2">
                {CORE_HABITS.filter((h) => h.group === "Family").map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleCore(h)}
                    disabled={day.closed}
                    className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm font-bold ${
                      day.core?.[h.id]
                        ? "border-emerald-300/30 bg-emerald-400/20 text-emerald-100"
                        : "border-[#1d3a55] bg-[#102338] text-slate-300"
                    } ${day.closed ? "opacity-40" : ""}`}
                  >
                    <span>{h.label}</span>
                    <span className="text-[#ffd84d]">+{h.points}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-[1.7rem] border border-[#1d3a55] bg-[#0d1b2a]/95 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-black text-[#7BAFD4]">Last 7 Days</div>
                  <div className="text-xs text-[#86a7c2]">Heat Strip</div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {last7.map((k) => {
                  const dayData = data[k];
                  const heatClass = getHeatClass(k, dayData);

                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => openHistoryDay(k)}
                      className={`h-10 rounded-xl border border-[#1d3a55] ${heatClass}`}
                    />
                  );
                })}
              </div>
            </section>

            <section className="mt-4 rounded-[1.7rem] border border-[#1d3a55] bg-[#0d1b2a]/95 p-4">
              <div className="font-black text-[#7BAFD4]">Latest Insight</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{insights[0]}</p>
            </section>
          </motion.main>
        )}

        {tab === "today" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section className="rounded-[1.7rem] border border-[#00B2A9]/25 bg-[#0c2528]/95 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="font-black text-[#00B2A9]">Core XP</div>
                  <div className="text-xs text-white/55">
                    {day.closed ? "Day Locked" : "Always Available"}
                  </div>
                </div>

                <div className="font-black text-[#F05A28]">
                  {score.core}/{MAX_CORE_POINTS}
                </div>
              </div>

              {CORE_SECTIONS.map((section) => {
                const habits = CORE_HABITS.filter((h) => h.group === section);

                if (!habits.length) return null;

                return (
                  <div
                    key={section}
                    className="mb-4 overflow-hidden rounded-3xl border border-[#00B2A9]/20 bg-[#0f3034] last:mb-0"
                  >
                    <div className="border-b border-[#00B2A9]/20 bg-black/10 px-4 py-3">
                      <SectionProgress section={section} day={day} />
                    </div>

                    {habits.map((h) => (
                      <HabitRow
                        key={h.id}
                        habit={h}
                        checked={Boolean(day.core?.[h.id])}
                        disabled={day.closed}
                        onToggle={toggleCore}
                        theme="today"
                      />
                    ))}
                  </div>
                );
              })}
            </section>

            <section className="mt-4 rounded-[1.7rem] border border-[#EC008C]/25 bg-[#0c2528]/95 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="font-black text-[#EC008C]">Bonus XP</div>
                  <div className="text-xs text-white/55">Unlocks After 85% Core Momentum</div>
                </div>

                <div className="font-black text-[#F05A28]">+{score.bonus}</div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-[#EC008C]/20 bg-[#0f3034]">
                {availableBonus.map((h) => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    checked={Boolean(day.bonus?.[h.id])}
                    locked={h.locked}
                    disabled={day.closed}
                    onToggle={toggleBonus}
                    bonus
                    theme="today"
                  />
                ))}
              </div>
            </section>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={toggleCloseDay}
              className={`mt-4 w-full rounded-[1.75rem] border-2 border-black px-6 py-6 text-lg font-black tracking-tight text-white shadow-2xl ${
                day.closed
                  ? "bg-slate-600 shadow-slate-500/20"
                  : "bg-emerald-500 shadow-emerald-500/20"
              }`}
            >
              {day.closed ? "🔓 Unlock Day" : "🏁 Finish Day"}
            </motion.button>
          </motion.main>
        )}

        {tab === "history" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section className="rounded-[1.7rem] border border-[#E56020]/30 bg-[#1D1160]/80 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="font-black text-[#F9A01B]">History</div>
                  <div className="text-xs text-white/55">Monthly Heatmap</div>
                </div>

                <div className="text-sm font-black text-slate-200">Best {stats.bestStreak}</div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-white/55">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={`${d}-${i}`}>{d}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {monthDays(date).map((k, i) => {
                  if (!k) return <div key={`blank-${i}`} />;

                  const dayData = data[k];
                  const heatClass = getHeatClass(k, dayData);

                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => openHistoryDay(k)}
                      className={`grid aspect-square place-items-center rounded-xl border border-[#E56020]/30 text-xs font-black ${heatClass}`}
                    >
                      {new Date(k + "T00:00:00").getDate()}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-4 rounded-[1.7rem] border border-[#E56020]/30 bg-[#1D1160]/80 p-4">
              <div className="font-black text-[#F9A01B]">All-Time Stats</div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label="Drift Days" value={totals.drift} theme="history" />
                <Stat label="Stable Days" value={totals.stable} theme="history" />
                <Stat label="Elite Days" value={totals.elite} theme="history" />
                <Stat label="Overdrive Days" value={totals.overdrive} theme="history" />
              </div>
            </section>

            <section className="mt-4 rounded-[1.7rem] border border-[#E56020]/30 bg-[#1D1160]/80 p-4">
              <div className="font-black text-[#F9A01B]">Monthly Comparison</div>

              <div className="mt-3 space-y-3">
                {monthlyComparison.length ? (
                  monthlyComparison.map((m) => <MonthlyBar key={m.month} month={m} />)
                ) : (
                  <div className="text-sm text-white/55">No Month Data Yet.</div>
                )}
              </div>
            </section>
          </motion.main>
        )}

        {tab === "insights" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section className="rounded-[1.7rem] border border-[#BF5700]/35 bg-[#171717]/95 p-4">
              <div className="font-black text-[#BF5700]">Pattern Intelligence</div>

              <div className="mt-3 overflow-hidden rounded-3xl border border-[#BF5700]/30 bg-[#222222]">
                {insights.map((x, i) => (
                  <div
                    key={i}
                    className="border-b border-[#BF5700]/25 px-4 py-4 text-sm leading-6 text-slate-300 last:border-b-0"
                  >
                    {x}
                  </div>
                ))}
              </div>
            </section>
          </motion.main>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#07111f]/92 px-3 py-3 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <NavButton active={tab === "home"} onClick={() => setTab("home")} icon={<Home size={18} />} label="Home" tabKey="home" />
          <NavButton active={tab === "today"} onClick={() => setTab("today")} icon={<Activity size={18} />} label="Today" tabKey="today" />
          <NavButton active={tab === "history"} onClick={() => setTab("history")} icon={<CalendarDays size={18} />} label="History" tabKey="history" />
          <NavButton active={tab === "insights"} onClick={() => setTab("insights")} icon={<Brain size={18} />} label="Intel" tabKey="insights" />
        </div>
      </nav>
    </div>
  );
}
