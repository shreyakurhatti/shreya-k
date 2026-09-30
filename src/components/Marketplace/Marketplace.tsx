import React, { useState } from 'react';
import {
  Store,
  Plus,
  CheckCircle2,
  DollarSign,
  MapPin,
  Star,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { MarketplaceListing } from '../../types/plastic';

export const Marketplace: React.FC = () => {
  const { marketplaceItems, claimListing, addListing, locationRegion } = useEco();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [contactModalListing, setContactModalListing] = useState<MarketplaceListing | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [polymer, setPolymer] = useState('PET (Resin #1)');
  const [resinCode, setResinCode] = useState(1);
  const [weightKg, setWeightKg] = useState(15);
  const [condition, setCondition] = useState<'Washed & Dried' | 'Crushed & Baled' | 'Shredded Flakes'>('Washed & Dried');
  const [sellerName, setSellerName] = useState('EcoCitizen Collective');
  const [city, setCity] = useState(locationRegion.split(',')[0] || 'Bengaluru');
  const [estimatedValue, setEstimatedValue] = useState(12.5);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addListing({
      title,
      polymer,
      resinCode,
      weightKg,
      condition,
      sellerName,
      sellerRating: 5.0,
      city,
      estimatedValue,
      imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    });

    setCreateModalOpen(false);
    setTitle('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setContactModalListing(null);
      setChatMessage('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Store className="w-3.5 h-3.5 text-lime-400" />
            <span>Circular Raw Materials Exchange</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Waste-to-Value Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Post cleaned, sorted batches of polymers to connect with local recyclers, eco-designers, and extrusion labs. Turn segregated waste into direct circular income.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>List Cleaned Plastic Batch (+120 XP)</span>
        </button>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {marketplaceItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
              item.claimed
                ? 'bg-slate-950/40 border-slate-800 opacity-60'
                : 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/40 shadow-xl'
            }`}
          >
            <div className="space-y-3">
              {/* Image & Claim status */}
              <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-800 relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  Resin #{item.resinCode}
                </span>

                {item.claimed && (
                  <span className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center font-display font-bold text-emerald-400 text-sm">
                    ✓ BATCH CLAIMED
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                <p className="text-[11px] text-slate-400">{item.polymer}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] block">Weight</span>
                  <span className="font-mono font-bold text-white">{item.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Estimated Value</span>
                  <span className="font-mono font-bold text-emerald-400">${item.estimatedValue}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {item.city}
                </span>
                <span className="flex items-center gap-1 font-mono text-amber-300">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  {item.sellerRating}
                </span>
              </div>
            </div>

            {/* Claim / Contact Buttons */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => setContactModalListing(item)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Contact Seller / Recycler"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => claimListing(item.id)}
                disabled={item.claimed}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  item.claimed
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{item.claimed ? 'Claimed' : 'Claim Batch (+80 XP)'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Listing Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">List Sorted Plastic Batch</h3>
                <p className="text-xs text-slate-400">Offer clean post-consumer plastic to local upcyclers</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Batch Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20kg Clean Crushed HDPE Milk Jugs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Polymer Type</label>
                  <select
                    value={polymer}
                    onChange={(e) => {
                      setPolymer(e.target.value);
                      if (e.target.value.includes('PET')) setResinCode(1);
                      else if (e.target.value.includes('HDPE')) setResinCode(2);
                      else if (e.target.value.includes('PP')) setResinCode(5);
                      else setResinCode(4);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  >
                    <option value="PET (Resin #1)">PET (Resin #1)</option>
                    <option value="HDPE (Resin #2)">HDPE (Resin #2)</option>
                    <option value="PP (Resin #5)">PP (Resin #5)</option>
                    <option value="LDPE (Resin #4)">LDPE (Resin #4)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  >
                    <option value="Washed & Dried">Washed & Dried</option>
                    <option value="Crushed & Baled">Crushed & Baled</option>
                    <option value="Shredded Flakes">Shredded Flakes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 5)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Price / Value ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(parseFloat(e.target.value) || 10)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold"
                >
                  Publish Listing (+120 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Recycler Modal */}
      {contactModalListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Contact Batch Provider</h3>
                <p className="text-xs text-slate-400">{contactModalListing.sellerName} • {contactModalListing.city}</p>
              </div>
              <button
                onClick={() => setContactModalListing(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {messageSent ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">Message Dispatched!</div>
                <p className="text-xs text-slate-400">
                  The provider has received your pickup inquiry and will coordinate via the Circular Hub.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Your Inbound Pickup Note:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Hi, our community maker studio can pick up this 30kg HDPE batch this Thursday at 2pm. Please confirm location!"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setContactModalListing(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                  >
                    Send Pickup Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
