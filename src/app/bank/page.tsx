"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ItemSlot from "@/components/ItemSlot";
import BankModal from "@/components/BankModal";

// Configuración de la grilla
const TOTAL_COLS = 14;
const TOTAL_ROWS = 7;
const TOTAL_SLOTS = TOTAL_COLS * TOTAL_ROWS;

export default function BankPage() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [gold, setGold] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalType, setModalType] = useState<"ADD_ITEM" | "EDIT_ITEM" | "MANAGE_GOLD" | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ index: number; item?: any } | null>(null);

  // Global Tooltip for empty slots
  const [emptySlotTooltip, setEmptySlotTooltip] = useState<{ x: number; y: number } | null>(null);

  // Tabs configuration
  const tabs = [
    { id: 0, name: "Principal", icon: "/tab-vault.png" },
    { id: 1, name: "Herboristería", icon: "/tab-herbs.png" },
    { id: 2, name: "Minería", icon: "/tab-ore.png" },
    { id: 3, name: "Varios", icon: "/tab-misc.png" },
  ];

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchData();
  }, [tabIndex]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, logsRes, goldRes] = await Promise.all([
        fetch(`/api/bank/items?tabIndex=${tabIndex}`),
        fetch(`/api/bank/logs`),
        fetch(`/api/bank/gold`),
      ]);

      const [itemsData, logsData, goldData] = await Promise.all([
        itemsRes.json(),
        logsRes.json(),
        goldRes.json(),
      ]);

      setItems(itemsData);
      setLogs(logsData);
      setGold(goldData.totalGold || 0);
    } catch (err) {
      console.error("Error fetching bank data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slotIndex: number, existingItem: any) => {
    if (!currentUser) return;
    setSelectedSlot({ index: slotIndex, item: existingItem });
    setModalType(existingItem ? "EDIT_ITEM" : "ADD_ITEM");
  };

  const handleGoldClick = () => {
    if (!currentUser) return;
    setModalType("MANAGE_GOLD");
  };

  const handleModalConfirm = async (formData: any) => {
    if (!currentUser) return;

    if (modalType === "MANAGE_GOLD") {
      const res = await fetch('/api/bank/gold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(formData.goldAmount) * 10000,
          action: formData.goldAction === "deposit" ? "gold_deposit" : "gold_withdraw",
          userId: currentUser.id,
          userName: currentUser.name
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error en la transacción de oro");
      }
    } else {
      if (formData.isDelete || formData.withdrawAmount) {
        await fetch('/api/bank/items', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tabIndex,
            slotIndex: selectedSlot?.index,
            withdrawAmount: formData.withdrawAmount,
            userId: currentUser.id,
            userName: currentUser.name
          })
        });
      } else {
        const res = await fetch('/api/bank/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: parseInt(formData.itemId),
            quantity: parseInt(formData.quantity),
            professionQuality: formData.professionQuality,
            tabIndex,
            slotIndex: selectedSlot?.index,
            userId: currentUser.id,
            userName: currentUser.name
          })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al actualizar item");
        }
      }
    }
    fetchData();
  };

  const formatGold = (copper: number) => {
    const goldCount = Math.floor(copper / 10000);
    const silverCount = Math.floor((copper % 10000) / 100);
    const copperCount = copper % 100;
    return { goldCount, silverCount, copperCount };
  };

  const handleSlotMouseEnter = (e: React.MouseEvent, item: any) => {
    if (!item) {
      setEmptySlotTooltip({ x: e.clientX, y: e.clientY });
    }
  };

  const handleSlotMouseMove = (e: React.MouseEvent, item: any) => {
    if (!item) {
      setEmptySlotTooltip({ x: e.clientX, y: e.clientY });
    }
  };

  const handleSlotMouseLeave = () => {
    setEmptySlotTooltip(null);
  };

  if (!mounted) return null;

  const { goldCount, silverCount, copperCount } = formatGold(gold);

  return (
    <div className="fixed inset-0 bg-[#0a0806] overflow-hidden select-none flex items-center justify-center font-sans font-medium">
      {/* Texture Background */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url('/bank-bg-plain.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.5) contrast(1.2)",
        }}
      />

      {/* Main UI Layout */}
      <div className="relative z-10 flex gap-4 w-full h-[95vh] max-w-[1600px] px-4">
        
        {/* Left Sidebar: Activity Logs */}
        <div className="flex flex-col w-72 flex-shrink-0 bg-black/70 border border-[#3d2e1a] rounded shadow-2xl overflow-hidden backdrop-blur-md self-center h-[80vh]">
          <div className="bg-[#1a120a] p-3 border-b border-[#3d2e1a] text-[#c8a96e] font-serif text-sm font-bold uppercase tracking-widest flex justify-between items-center">
            <span>Registro de Actividad</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-black/40">
            {logs.length === 0 ? (
              <div className="text-[#5a4832] text-xs text-center mt-10 italic">No hay registros recientes</div>
            ) : (
              logs.map((log, i) => (
                <div key={log._id || i} className="bg-[#110e0b] p-2 border border-[#2a1f14] rounded text-[11px] leading-tight animate-fade-in hover:border-[#3d2e1a] transition-colors">
                  <div className="flex justify-between mb-1">
                    <span className="text-amber-500 font-bold">{log.userName}</span>
                    <span className="text-[#4a3a2a]">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-[#c8a96e]">
                    {log.action === 'deposit' && (
                      <>Depositó <span className="text-white">x{log.quantity} {log.itemName}</span></>
                    )}
                    {log.action === 'withdraw' && (
                      <>Retiró <span className="text-white">x{log.quantity} {log.itemName}</span></>
                    )}
                    {log.action === 'gold_deposit' && (
                      <>Depositó <span className="text-yellow-400">{(log.goldAmount / 10000).toLocaleString()}g</span></>
                    )}
                    {log.action === 'gold_withdraw' && (
                      <>Retiró <span className="text-yellow-400">{(log.goldAmount / 10000).toLocaleString()}g</span></>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center: Bank Grid */}
        <div className="flex-1 flex flex-col gap-4 h-full py-4">
          <div className="flex-1 flex flex-col bg-black/60 border-2 border-[#3d2e1a] rounded-lg shadow-2xl relative overflow-hidden backdrop-blur-sm">
            {/* Bank Header Section */}
            <div className="h-12 bg-gradient-to-b from-[#2a1f14] to-[#150f0a] border-b border-[#3d2e1a] flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <span className="text-[#c8a96e] font-serif font-bold text-sm tracking-wide">
                  Pestaña: <span className="text-white ml-2">{tabs[tabIndex].name}</span>
                </span>
              </div>
              <button
                onClick={() => (window.location.href = "/login")}
                className="text-[#c8a96e] text-[11px] font-bold hover:text-white transition-colors uppercase tracking-widest px-4 py-1.5 border border-[#3d2e1a] bg-black/40 rounded hover:bg-black/80 shadow-inner"
              >
                Cerrar Banco
              </button>
            </div>

            {/* The Grid Area */}
            <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
              <div 
                className="grid gap-1 w-full max-w-[1200px]"
                style={{
                  gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${TOTAL_ROWS}, 1fr)`,
                  aspectRatio: `${TOTAL_COLS} / ${TOTAL_ROWS}`,
                }}
              >
                {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
                  const itemInSlot = items.find(it => it.slotIndex === i);
                  return (
                    <div 
                      key={`${tabIndex}-${i}`} 
                      className="h-full w-full"
                      onMouseEnter={(e) => handleSlotMouseEnter(e, itemInSlot)}
                      onMouseMove={(e) => handleSlotMouseMove(e, itemInSlot)}
                      onMouseLeave={handleSlotMouseLeave}
                    >
                      <ItemSlot
                        slotIndex={i}
                        item={itemInSlot}
                        onAction={(item) => handleSlotClick(i, item)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom: Gold Counter */}
            <div 
              className="h-10 bg-[#150f0a] border-t border-[#3d2e1a] flex items-center justify-end px-6 space-x-4 cursor-pointer hover:bg-[#1a130d] transition-colors"
              onClick={handleGoldClick}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-1.5 group cursor-help">
                  <span className="text-white font-bold text-sm textShadow">{goldCount.toLocaleString()}</span>
                  <div className="w-3.5 h-3.5 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full border border-black shadow-[0_0_5px_rgba(251,191,36,0.3)]" />
                </div>
                <div className="flex items-center gap-1.5 group">
                  <span className="text-[#c8c8c8] font-bold text-sm textShadow">{silverCount}</span>
                  <div className="w-3.5 h-3.5 bg-gradient-to-br from-[#e0e0e0] to-[#808080] rounded-full border border-black" />
                </div>
                <div className="flex items-center gap-1.5 group">
                  <span className="text-[#b87333] font-bold text-sm textShadow">{copperCount}</span>
                  <div className="w-3.5 h-3.5 bg-gradient-to-br from-[#cd7f32] to-[#4a2e12] rounded-full border border-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Tabs and Cheat Sheet */}
        <div className="flex flex-col gap-4 self-center py-10 flex-shrink-0">
          {/* Tabs */}
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabIndex(tab.id)}
                className={`w-14 h-14 rounded-r-lg border-2 border-l-0 transition-all duration-200 flex items-center justify-center relative group
                  ${tabIndex === tab.id 
                    ? 'bg-[#3d2e1a] border-[#c8a96e] translate-x-2 shadow-[0_0_15px_rgba(200,169,110,0.3)] z-20' 
                    : 'bg-[#1a120a] border-[#2a1f14] hover:bg-[#2a1f14] hover:border-[#3d2e1a] z-10'}`}
              >
                <div className={`relative w-10 h-10 overflow-hidden rounded shadow-md transition-all ${tabIndex === tab.id ? 'scale-110' : 'opacity-60 group-hover:opacity-100'}`}>
                  <Image 
                    src={tab.icon} 
                    alt={tab.name} 
                    fill
                    className={`object-cover scale-[1.3] ${tabIndex === tab.id ? 'brightness-110' : ''}`}
                  />
                </div>
                {/* Tooltip for tab */}
                <div className="absolute right-full mr-4 bg-[#0a0a0f] border border-[#c8a96e] px-3 py-1.5 rounded text-xs text-[#c8a96e] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all font-bold shadow-2xl z-50">
                  {tab.name}
                </div>
              </button>
            ))}
          </div>

          {/* Cheat Sheet Toggle/Sidebar (Simplified for now) */}
          <div className="mt-8 bg-black/70 border border-[#3d2e1a] rounded p-3 w-48 shadow-2xl backdrop-blur-md">
            <h3 className="text-[#c8a96e] font-serif text-[10px] font-bold uppercase tracking-widest mb-3 border-b border-[#3d2e1a] pb-2">IDs de items Comunes</h3>
            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
              {[
                { id: 236767, name: "Flor de Tranquilidad" },
                { id: 236777, name: "Hojargenta" },
                { id: 236775, name: "Azerraíz" },
                { id: 236779, name: "Lirio de maná" },
                { id: 236771, name: "Sanguispino" },
                { id: 236780, name: "Loto nocturno" },
                { id: 236949, name: "Mota de luz" },
                { id: 236952, name: "Mota de Vacío puro" },
                { id: 236951, name: "Mota de magia salvaje" },
                { id: 236950, name: "Mota de energía primigenia" },
                { id: 237361, name: "Mena de cobre refulgente" },
                { id: 237365, name: "Mena de plata brillante" },
                { id: 237363, name: "Mena de estaño umbrío" },
                { id: 237366, name: "Torio deslumbrante" },
              ].map((itemCheat) => (
                <div 
                  key={itemCheat.id}
                  className="flex flex-col gap-0.5 p-1.5 hover:bg-[#3d2e1a]/30 rounded transition-colors cursor-pointer group"
                  onClick={() => {
                    // Just to show we can copy or use it later
                    navigator.clipboard.writeText(itemCheat.id.toString());
                    alert(`ID ${itemCheat.id} copiado al portapapeles`);
                  }}
                >
                  <span className="text-[#c8a96e] text-[9px] font-bold group-hover:text-white">{itemCheat.name}</span>
                  <span className="text-[#5a4832] text-[8px] font-mono group-hover:text-[#c8a96e]">ID: {itemCheat.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BankModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        type={modalType || "ADD_ITEM"}
        title={
          modalType === "ADD_ITEM" ? "Añadir Item" :
          modalType === "EDIT_ITEM" ? `Editar ${selectedSlot?.item?.name}` :
          "Gestionar Oro"
        }
        initialData={selectedSlot?.item}
        onConfirm={handleModalConfirm}
      />

      {/* Global Empty Slot Tooltip */}
      {emptySlotTooltip && (
        <div
          style={{
            position: "fixed",
            left: emptySlotTooltip.x + 16,
            top: emptySlotTooltip.y - 12,
            zIndex: 10000,
            pointerEvents: "none",
          }}
          className="animate-fade-in"
        >
          <div className="bg-[#0a0a0f] border border-[#1a3a5c] outline outline-1 outline-black rounded-sm px-3 py-1.5 shadow-2xl">
            <span className="text-[#888] font-serif text-[13px] font-bold shadow-sm">Slot vacío</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3d2e1a;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c8a96e;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .textShadow {
          text-shadow: 0 1px 2px rgba(0,0,0,0.9);
        }
      `}</style>
    </div>
  );
}
