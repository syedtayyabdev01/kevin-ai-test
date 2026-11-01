import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Activity, Bot, BrainCircuit, CheckCircle2, Command, Cpu, FolderKanban, Gauge, KeyRound, Plus, Search, Settings2, ShieldCheck, Sparkles, TerminalSquare, Workflow, Zap, Eye, EyeOff, Trash2, PlugZap } from "lucide-react";

type Provider = { id: string; name: string; configured: boolean };
const workers = [
  { name: "Kevin", role: "Orchestrator", symbol: "K", tone: "gold", detail: "Plans tasks and delegates work" },
  { name: "Nova", role: "Research worker", symbol: "N", tone: "violet", detail: "Research and source summaries" },
  { name: "Kairo", role: "Coding worker", symbol: "K", tone: "blue", detail: "Code analysis and project changes" },
  { name: "Astra", role: "PC operator", symbol: "A", tone: "mint", detail: "Local actions behind your approval" }
];
const links = [["Command Center", Gauge], ["AI Workers", Bot], ["Tasks & Runs", Workflow], ["Projects", FolderKanban], ["Activity Logs", TerminalSquare]];
const providerOptions = [
  { id: "openai", name: "OpenAI", hint: "api.openai.com/v1" },
  { id: "gemini", name: "Google Gemini", hint: "generativelanguage.googleapis.com/v1beta" },
  { id: "groq", name: "Groq", hint: "api.groq.com/openai/v1" },
  { id: "anthropic", name: "Anthropic Claude", hint: "api.anthropic.com/v1" },
  { id: "openrouter", name: "OpenRouter", hint: "openrouter.ai/api/v1" },
  { id: "ollama", name: "Ollama (local)", hint: "localhost:11434/api" },
  { id: "custom", name: "Custom OpenAI-compatible", hint: "Your provider base URL" }
];

export default function App() {
  const [active, setActive] = useState("Command Center");
  const [task, setTask] = useState("");
  const [notice, setNotice] = useState("Connect a provider to enable real AI runs.");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [runtimeAvailable, setRuntimeAvailable] = useState(true);

  const refreshProviders = async () => {
    try { setProviders(await invoke<Provider[]>("list_provider_status")); setRuntimeAvailable(true); }
    catch { setRuntimeAvailable(false); }
  };
  useEffect(() => { void refreshProviders(); }, []);

  const saveProvider = async () => {
    setBusy(true); setNotice("Testing provider connection…");
    try {
      const result = await invoke<string>("test_and_save_provider", { providerId: provider, apiKey, baseUrl: baseUrl || null });
      setNotice(result); setApiKey(""); await refreshProviders();
    } catch (error) { setNotice(String(error)); }
    finally { setBusy(false); }
  };
  const removeProvider = async (id: string) => {
    setBusy(true);
    try { await invoke("remove_provider_key", { providerId: id }); setNotice("Saved credential removed from the operating-system vault."); await refreshProviders(); }
    catch (error) { setNotice(String(error)); }
    finally { setBusy(false); }
  };
  const selectedProvider = providerOptions.find(p => p.id === provider)!;
  const connectedCount = providers.filter(p => p.configured).length;

  return <div className="shell"><aside className="side"><div className="brand"><b>K✦</b><span>KEVIN <i>AI</i><small>WORKFORCE SYSTEM</small></span></div><div className="workspace"><Command size={17}/> Personal Workspace</div><label>WORKSPACE</label>{links.map(([name, Icon]: any) => <button className={active === name ? "nav active" : "nav"} onClick={() => setActive(name)} key={name}><Icon size={17}/>{name}</button>)}<label>SYSTEM</label><button className={active === "Provider Settings" ? "nav active" : "nav"} onClick={() => setActive("Provider Settings")}><KeyRound size={17}/>Provider Settings</button><button className={active === "Settings" ? "nav active" : "nav"} onClick={() => setActive("Settings")}><Settings2 size={17}/>Settings</button><div className="secure"><ShieldCheck size={17}/> Local-first security</div><div className="user">KT　 Kevin Trader</div></aside>
    <main><header>Workspace　/　<b>{active}</b><span><i/> {runtimeAvailable ? "DESKTOP RUNTIME CONNECTED" : "OPEN DESKTOP APP"}　 •　 LOCAL MODE　 <Search size={16}/></span></header><section className="content">
      {active === "Provider Settings" ? <><div className="intro"><div><small><PlugZap size={13}/> MODEL CONNECTIONS</small><h1>Provider <em>Settings</em></h1><p>Connect API providers. Keys are stored by your operating system, never in browser storage.</p></div><div className="chip"><ShieldCheck size={14}/> ENCRYPTED OS VAULT</div></div>
        {!runtimeAvailable && <div className="notice warning">Open KEVIN AI TEST as the desktop app to use secure credential storage. Browser preview cannot access the OS vault.</div>}
        <div className="provider-layout"><article className="panel provider-form"><h2>Connect a provider <small>VERIFY BEFORE SAVE</small></h2><p>Select a provider, add its key and test the connection. The key is saved only after a successful check.</p><label className="field-label">AI PROVIDER</label><select value={provider} onChange={e => setProvider(e.target.value)}>{providerOptions.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select><label className="field-label">API KEY {provider === "ollama" ? "(OPTIONAL)" : ""}</label><div className="key-input"><input type={showKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={provider === "ollama" ? "Leave blank for local Ollama" : "Paste your API key"} autoComplete="off"/><button onClick={() => setShowKey(!showKey)} aria-label="Toggle API key visibility">{showKey ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div><label className="field-label">BASE URL <span>OPTIONAL EXCEPT CUSTOM</span></label><input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder={selectedProvider.hint}/><p className="field-help">Remote endpoints require HTTPS. HTTP is accepted only for localhost.</p><button className="primary wide" disabled={busy || !runtimeAvailable} onClick={saveProvider}>{busy ? "Testing…" : "Test connection & save"} <PlugZap size={15}/></button></article>
        <article className="panel"><h2>Connected providers <small>{connectedCount} ACTIVE</small></h2><p>Credentials are held in Windows Credential Manager, macOS Keychain, or Linux Secret Service.</p><div className="provider-list">{providerOptions.map(p => { const status = providers.find(x => x.id === p.id); return <div className="provider-row" key={p.id}><div className="provider-mark">{p.name.slice(0,1)}</div><div className="provider-info"><b>{p.name}</b><small>{status?.configured ? "Credential saved" : "Not connected"}</small></div><span className={status?.configured ? "state connected" : "state"}>{status?.configured ? "CONNECTED" : "OFFLINE"}</span>{status?.configured && <button className="icon-button" disabled={busy} onClick={() => removeProvider(p.id)} title="Remove saved key"><Trash2 size={15}/></button>}</div>; })}</div></article></div>
      </> : <>
        <div className="intro"><div><small><Sparkles size={13}/> YOUR AI WORKFORCE, YOUR RULES</small><h1>Command <em>Center</em></h1><p>Configure models, assign workers, and run meaningful tasks.</p></div><div className="chip"><Activity size={14}/> {runtimeAvailable ? "DESKTOP CONNECTED" : "PREVIEW MODE"}</div></div>
        <div className="stats"><article><small>AI WORKERS</small><strong>04</strong><p>Worker profiles created</p><Bot/></article><article><small>CONNECTED PROVIDERS</small><strong>{String(connectedCount).padStart(2, "0")}</strong><p>Secure credentials saved</p><BrainCircuit/></article><article><small>ACTIVE RUNS</small><strong>00</strong><p>Task runtime not enabled</p><Zap/></article><article><small>WORKERS READY</small><strong>00</strong><p>Awaiting worker runtime</p><CheckCircle2/></article></div>
        <div className="section-title"><div><h2>Worker squad</h2><p>Specialist agents awaiting model assignment.</p></div><button onClick={() => setActive("AI Workers")}>Manage workers</button></div><div className="workers">{workers.map(w => <article className="worker" key={w.name}><div className={"portrait " + w.tone}>{w.symbol}<sup>✦</sup></div><small className="pending">● NOT CONFIGURED</small><h3>{w.name}</h3><b>{w.role}</b><p>{w.detail}</p><footer>Model unassigned <button onClick={() => setActive("Provider Settings")}>Configure ↗</button></footer></article>)}</div>
        <div className="lower"><article className="panel"><h2>Quick task <small>RUNTIME PENDING</small></h2><p>Task execution will be enabled when the worker runtime is implemented.</p><textarea value={task} onChange={e => setTask(e.target.value)} placeholder="Describe a future task…"/><button className="primary" disabled><Plus size={15}/> Runtime not available yet</button></article><article className="panel"><h2>System status</h2><p>Verified implementation status</p><div className="status"><CheckCircle2/> Desktop UI shell <b>READY</b></div><div className="status"><ShieldCheck/> OS credential vault <b>{runtimeAvailable ? "AVAILABLE" : "DESKTOP ONLY"}</b></div><div className="status"><BrainCircuit/> Provider connection tests <b>IMPLEMENTED</b></div><div className="status"><Cpu/> Worker runtime <b>PENDING</b></div></article></div>
      </>}
      <div className="notice"><Sparkles size={15}/>{notice}</div><div className="copyright">KEVIN AI TEST　•　BUILD 0.2.0 PROVIDER CONNECTIONS　•　LOCAL-FIRST BY DESIGN</div>
    </section></main></div>;
}
