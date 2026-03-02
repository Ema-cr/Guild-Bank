"use client";

import { useState, useEffect } from "react";

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "ADD_ITEM" | "EDIT_ITEM" | "MANAGE_GOLD";
  initialData?: any;
  onConfirm: (data: any) => Promise<void>;
}

export default function BankModal({
  isOpen,
  onClose,
  title,
  type,
  initialData,
  onConfirm
}: BankModalProps) {
  const [formData, setFormData] = useState({
    itemId: "",
    quantity: "1",
    professionQuality: 1, // 1, 2, 3
    withdrawQuantity: "1",
    goldAmount: "0",
    goldAction: "deposit" as "deposit" | "withdraw"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (type === "EDIT_ITEM" && initialData) {
        setFormData(prev => ({ 
          ...prev, 
          itemId: initialData.itemId.toString(), 
          quantity: initialData.quantity.toString(),
          professionQuality: initialData.professionQuality || 1,
          withdrawQuantity: "1"
        }));
      } else if (type === "MANAGE_GOLD") {
        setFormData(prev => ({ ...prev, goldAmount: "0" }));
      } else {
        setFormData({ itemId: "", quantity: "1", professionQuality: 1, withdrawQuantity: "1", goldAmount: "0", goldAction: "deposit" });
      }
      setError(null);
    }
  }, [isOpen, type, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConfirm(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handlePartialWithdraw = async () => {
    const amount = parseInt(formData.withdrawQuantity);
    if (isNaN(amount) || amount <= 0) {
      setError("Cantidad inválida");
      return;
    }
    if (amount > parseInt(formData.quantity)) {
      setError("No puedes retirar más de lo que hay");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm({ ...formData, withdrawAmount: amount });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#0d0d0d] border-2 border-[#3d2e1a] rounded-lg shadow-[0_0_50px_rgba(0,0,0,1)] p-1 overflow-hidden"
        style={{
          boxShadow: "0 0 0 1px #000, 0 10px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(61,46,26,0.3)"
        }}
      >
        {/* Header decoration */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#c8a96e] to-transparent opacity-50 mb-1" />
        
        <div className="bg-[#1a120a] p-6 border border-[#2a1f14] rounded overflow-y-auto max-h-[90vh] custom-scrollbar">
          <h2 className="text-xl font-serif font-bold text-[#c8a96e] mb-6 text-center tracking-wide uppercase border-b border-[#3d2e1a] pb-4">
            {title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {type !== "MANAGE_GOLD" && (
              <>
                <div className="space-y-2">
                  <label className="block text-[#c8a96e] text-xs font-bold uppercase tracking-widest">ID del Item</label>
                  <input
                    type="number"
                    required
                    disabled={type === "EDIT_ITEM"}
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    className="w-full bg-black/60 border border-[#3d2e1a] rounded p-3 text-white focus:border-[#c8a96e] outline-none transition-colors font-mono"
                    placeholder="Ej: 152507"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[#c8a96e] text-xs font-bold uppercase tracking-widest">Calidad del Item</label>
                  <div className="flex gap-4 p-2 bg-black/40 border border-[#3d2e1a] rounded">
                    {[
                      { val: 1, label: "Bronce", color: "#cd7f32" },
                      { val: 2, label: "Plata", color: "#e0e0e0" },
                      { val: 3, label: "Oro", color: "#fbbf24" }
                    ].map((q) => (
                      <button
                        key={q.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, professionQuality: q.val })}
                        className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded transition-all border ${
                          formData.professionQuality === q.val 
                            ? "bg-[#3d2e1a]/40 border-[#c8a96e] shadow-inner" 
                            : "border-transparent opacity-60 hover:opacity-100 hover:border-[#3d2e1a]"
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-black shadow-sm"
                          style={{ backgroundColor: q.color }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-[#c8a96e]">
                          {q.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[#c8a96e] text-xs font-bold uppercase tracking-widest">
                    {type === "EDIT_ITEM" ? "Cantidad en Banco" : "Cantidad (Máx 20)"}
                  </label>
                  <input
                    type="number"
                    required
                    disabled={type === "EDIT_ITEM"}
                    min="1"
                    max="20"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-black/60 border border-[#3d2e1a] rounded p-3 text-white focus:border-[#c8a96e] outline-none transition-colors font-mono"
                  />
                </div>
              </>
            )}

            {type === "MANAGE_GOLD" && (
              <>
                <div className="flex gap-2 p-1 bg-black/40 border border-[#3d2e1a] rounded mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, goldAction: "deposit" })}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${
                      formData.goldAction === "deposit" 
                        ? "bg-[#3d2e1a] text-[#c8a96e] shadow-inner" 
                        : "text-[#5a4832] hover:text-[#c8a96e]"
                    }`}
                  >
                    Depositar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, goldAction: "withdraw" })}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all ${
                      formData.goldAction === "withdraw" 
                        ? "bg-[#3d2e1a] text-[#c8a96e] shadow-inner" 
                        : "text-[#5a4832] hover:text-[#c8a96e]"
                    }`}
                  >
                    Retirar
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-[#c8a96e] text-xs font-bold uppercase tracking-widest">Cantidad de Oro</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.goldAmount}
                      onChange={(e) => setFormData({ ...formData, goldAmount: e.target.value })}
                      className="w-full bg-black/60 border border-[#3d2e1a] rounded p-3 text-white focus:border-[#c8a96e] outline-none transition-colors font-mono pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full border border-black shadow-[0_0_5px_rgba(251,191,36,0.3)]" />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-400 text-xs bg-red-900/20 border border-red-900/50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-[#3d2e1a] text-[#c8a96e] font-bold uppercase tracking-widest rounded hover:bg-[#3d2e1a]/20 transition-all text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-b from-[#3d2e1a] to-[#1a120a] border border-[#c8a96e] text-[#c8a96e] font-bold uppercase tracking-widest rounded hover:brightness-125 transition-all text-xs shadow-lg disabled:opacity-50"
              >
                {loading ? "Procesando..." : (type === "EDIT_ITEM" ? "Guardar Cambios" : "Confirmar")}
              </button>
            </div>
            
            {type === "EDIT_ITEM" && (
              <div className="flex flex-col gap-3 mt-6 border-t border-[#3d2e1a] pt-4">
                <div className="space-y-2">
                  <label className="block text-[#c8a96e] text-[10px] font-bold uppercase tracking-widest text-center">Retirar Cantidad Parcial</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={formData.quantity}
                      value={formData.withdrawQuantity}
                      onChange={(e) => setFormData({ ...formData, withdrawQuantity: e.target.value })}
                      className="flex-1 bg-black/60 border border-[#3d2e1a] rounded p-2 text-white text-sm focus:border-[#4fc3f7] outline-none transition-colors font-mono"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handlePartialWithdraw}
                      className="px-4 py-2 bg-[#3d2e1a] border border-[#c8a96e] text-[#c8a96e] text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#c8a96e] hover:text-black transition-all shadow-lg disabled:opacity-50"
                    >
                      Sacar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <a
                    href={`https://www.wowhead.com/item=${formData.itemId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 bg-[#2a1f14] border border-[#3d2e1a] text-[#c8a96e] text-[9px] font-bold uppercase tracking-widest text-center rounded hover:bg-[#3d2e1a] transition-all shadow-inner"
                  >
                    WoWhead
                  </a>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      if (confirm("¿Estás seguro de que quieres retirar TODO este item?")) {
                        setLoading(true);
                        try {
                          await onConfirm({ ...formData, isDelete: true });
                          onClose();
                        } catch (err: any) {
                          setError(err.message);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="py-2 bg-red-950/20 border border-red-900/40 text-red-500/80 hover:bg-red-950/40 hover:text-red-500 text-[9px] font-bold uppercase tracking-widest rounded transition-all"
                  >
                    Retirar Todo
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Footer decoration */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#c8a96e] to-transparent opacity-50 mt-1" />
      </div>

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
      `}</style>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
