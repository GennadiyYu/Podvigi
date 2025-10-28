import fetch from "node-fetch";
import { Telegraf } from "telegraf";
import { assignNumberIfNeeded, countIssued, whois } from "../lib/db.js";
const BOT_TOKEN=process.env.BOT_TOKEN;
const CHANNEL=process.env.CHANNEL||"@podvigi";
const ADMIN_USERNAMES=(process.env.ADMIN_USERNAMES||"").split(",").map(s=>s.trim().replace(/^@/,"")).filter(Boolean);
const WEBHOOK_SECRET=process.env.TELEGRAM_WEBHOOK_SECRET;
if(!BOT_TOKEN) throw new Error("BOT_TOKEN is required");
const bot=new Telegraf(BOT_TOKEN,{handlerTimeout:9000});
function isAdmin(ctx){ const u=ctx.from; if(!u) return false; return ADMIN_USERNAMES.includes((u.username||"").replace(/^@/,"")); }
const defaultCommands=[{command:"start",description:"Начать / инструкция"},{command:"help",description:"Помощь"}];
const adminCommands=[{command:"issued_count",description:"Сколько номеров выдано"},{command:"whois",description:"По номеру — кто это"}];
async function setCommandsForChat(ctx,isAdminFlag){ const scope={type:"chat",chat_id:ctx.chat.id}; const commands=isAdminFlag?[...defaultCommands,...adminCommands]:defaultCommands; try{ await ctx.telegram.setMyCommands(commands,{scope}); }catch(e){ console.warn("setMyCommands error:",e.message); } }
bot.telegram.setMyCommands(defaultCommands).catch(()=>{});
async function isSubscribed(ctx){ try{ const res=await ctx.telegram.getChatMember(CHANNEL,ctx.from.id); return ["member","administrator","creator"].includes(res.status);}catch(e){ console.warn("getChatMember error",e.message); return false; } }
bot.start(async ctx=>{ await setCommandsForChat(ctx,isAdmin(ctx)); await ctx.reply(`Привет! Я выдам тебе уникальный номер после проверки подписки на <b>${CHANNEL}</b>\n\n`+`1) Подпишись на канал ${CHANNEL}\n`+`2) Нажми кнопку ниже для проверки подписки`,{parse_mode:"HTML",reply_markup:{inline_keyboard:[[ {text:"✅ Проверить подписку",callback_data:"check_sub"} ]]}}); });
bot.command("refresh_menu", async ctx=>{ if(!isAdmin(ctx)) return; await setCommandsForChat(ctx,true); await ctx.reply("Меню администратора обновлено ✅"); });
bot.action("check_sub", async ctx=>{ if(!(await isSubscribed(ctx))){ await ctx.editMessageText(`Подписка не найдена. Убедись, что ты подписан на <b>${CHANNEL}</b> и попробуй ещё раз.`,{parse_mode:"HTML",reply_markup:{inline_keyboard:[[ {text:"✅ Проверить подписку",callback_data:"check_sub"} ]]}}); return; } const number=await assignNumberIfNeeded(ctx.from); await ctx.editMessageText(`Подписка подтверждена! Твой уникальный номер: <b>#${number}</b>\n\n`+`Номер закреплён за твоим аккаунтом и повторно выдан не будет.`,{parse_mode:"HTML"}); });
bot.command("issued_count", async ctx=>{ if(!isAdmin(ctx)) return; const total=await countIssued(); await ctx.reply(`Выдано номеров: <b>${total}</b>`,{parse_mode:"HTML"}); });
bot.command("whois", async ctx=>{ if(!isAdmin(ctx)) return; const text=ctx.message.text||""; const m=text.match(/\/(?:whois)\s+(\d+)/i); if(!m) return ctx.reply("Использование: /whois <номер>"); const number=m[1]; const data=await whois(number); if(!data) return ctx.reply("Пользователь с таким номером не найден."); const {userId,profile}=data; const uname=profile?.username?`@${profile.username}`:"<без ника>"; const name=[profile?.first_name,profile?.last_name].filter(Boolean).join(" ")||"<без имени>"; return ctx.reply(`Номер <b>#${number}</b> выдан пользователю:\n`+`Имя: ${name}\n`+`Ник: ${uname}\n`+`ID: <code>${userId}</code>\n`+`В базе с: ${profile?.created_at||"—"} UTC`,{parse_mode:"HTML"}); });
export default async function handler(req,res){ if(WEBHOOK_SECRET){ const header=req.headers["x-telegram-bot-api-secret-token"]; if(header!==WEBHOOK_SECRET){ return res.status(401).send("Invalid secret"); } } if(req.method==="POST"){ try{ await bot.handleUpdate(req.body); return res.status(200).json({ok:true}); }catch(e){ console.error("handleUpdate error",e); return res.status(500).json({ok:false}); } } return res.status(200).send("OK"); }
