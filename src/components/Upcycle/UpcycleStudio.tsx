import React, { useState } from 'react';
import {
  Sparkles,
  Scissors,
  Clock,
  CheckCircle2,
  Filter,
  PlusCircle,
  Award,
  Layers,
  Search,
} from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { UpcycleProject } from '../../types/plastic';

export const UpcycleStudio: React.FC = () => {
  const { activeScan, triggerConfetti } = useEco();

  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Advanced'>('All');
  const [selectedProject, setSelectedProject] = useState<UpcycleProject | null>(null);
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [customItemInput, setCustomItemInput] = useState('');
  const [customIdeas, setCustomIdeas] = useState<UpcycleProject[]>([]);
  const [generatingCustom, setGeneratingCustom] = useState(false);

  // Default library of inspiring DIY projects
  const CURATED_PROJECTS: UpcycleProject[] = [
    {
      title: 'Capillary Self-Watering Indoor Herb Garden',
      difficulty: 'Easy',
      estimatedTime: '15 mins',
      materialsNeeded: ['2L PET Beverage Bottle', 'Cotton twine or rope', 'Potting soil', 'Basil/Mint seedling', 'Utility shears'],
      steps: [
        'Slice the PET bottle horizontally into two halves about 12cm below the cap.',
        'Puncture a 6mm hole through the center of the plastic bottle cap using a screwdriver or awl.',
        'Thread a 20cm cotton string through the cap hole, knotting it inside so half stays submerged and half extends into the soil.',
        'Invert the top funnel section into the bottom base reservoir.',
        'Fill the top cone with potting soil and your herb plant, and pour 250ml water into the reservoir below. The capillary wick will keep roots hydrated for 10 days!',
      ],
    },
    {
      title: 'Ergonomic Heavy-Duty Garden Trowel & Soil Scoop',
      difficulty: 'Easy',
      estimatedTime: '10 mins',
      materialsNeeded: ['HDPE Milk or Laundry Jug with handle', 'Utility blade or heavy shears', 'Fine sandpaper (120-grit)'],
      steps: [
        'Clean and dry the HDPE detergent or milk jug thoroughly.',
        'Draw a diagonal line from the base across the front face pointing downwards opposite the handle.',
        'Cut along the outline using sturdy shears, preserving the hollow handle as your ergonomic grip.',
        'Lightly buff the cut edge with sandpaper to remove sharp plastic burrs. You now have an unbreakable, rust-free potting trowel!',
      ],
    },
    {
      title: 'Interlocking Modular Workshop Hardware Organizer',
      difficulty: 'Medium',
      estimatedTime: '25 mins',
      materialsNeeded: ['4-6 Clean PP Takeaway Tubs', 'Double-sided mounting tape or hot glue', 'Permanent marker'],
      steps: [
        'Thoroughly wash and degrease polypropylene restaurant containers.',
        'Trim lids or interlock containers side-by-side using strips of mounting tape.',
        'Label individual compartments: Screws, Washers, Hex Nuts, Drywall Anchors, USB Adapters.',
        'Stack into workbench drawers for tidy, high-durability organization.',
      ],
    },
    {
      title: 'Acoustic & Thermal Bubble Mailer Window Insulation Panels',
      difficulty: 'Easy',
      estimatedTime: '15 mins',
      materialsNeeded: ['Clean LDPE Bubble mailers', 'Spray bottle with tap water', 'Utility knife'],
      steps: [
        'Cut bubble sheets to match your window pane dimensions.',
        'Mist the glass lightly with tap water (surface tension holds the polyethylene film naturally without glue).',
        'Press the bubble side flat against the damp glass. The trapped air bubbles provide an R-value boost and reduce winter heat loss by up to 20%!',
      ],
    },
    {
      title: 'Geometric Hanging Micro-Lantern & Fairy Chandelier',
      difficulty: 'Advanced',
      estimatedTime: '40 mins',
      materialsNeeded: ['3 PET Mineral Water Bottles', 'LED wire fairy lights (low heat)', 'Craft knife', 'Hole punch'],
      steps: [
        'Cut 8cm cylindrical bands from the center of 3 clear PET bottles.',
        'Slice decorative 5mm parallel fringes around the circumference.',
        'Pinch and fold petals outward into 3D origami geometric rosettes.',
        'Thread copper wire fairy lights through the core for an enchanting refracted ambient light fixture.',
      ],
    },
    {
      title: 'Eco-Mortar Lightweight Planter Drainage Layer',
      difficulty: 'Easy',
      estimatedTime: '5 mins',
      materialsNeeded: ['Washed EPS Styrofoam (#6)', 'Heavy planter pot', 'Potting mix'],
      steps: [
        'Break clean polystyrene foam into 2-3cm gravel-sized chunks.',
        'Layer 5cm of foam chunks across the bottom of large outdoor flower pots instead of heavy rocks.',
        'Provides aeration, prevents root rot, and reduces overall pot weight by 70% so you can easily move plants to sunny spots!',
      ],
    },
  ];

  // Combine active scan ideas with curated library
  const allProjects = [
    ...(activeScan?.upcycleIdeas || []),
    ...customIdeas,
    ...CURATED_PROJECTS,
  ];

  const filteredProjects = allProjects.filter((p) => {
    if (filterDifficulty === 'All') return true;
    return p.difficulty === filterDifficulty;
  });

  const handleComplete = (title: string) => {
    if (!completedProjects.includes(title)) {
      setCompletedProjects([...completedProjects, title]);
      triggerConfetti();
    }
  };

  const handleGenerateCustom = async () => {
    if (!customItemInput.trim()) return;
    setGeneratingCustom(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate 2 creative, practical DIY upcycling projects for: "${customItemInput}". Include title, difficulty (Easy or Medium), estimatedTime, materialsNeeded, and step-by-step instructions. Return as JSON array with properties: title, difficulty, estimatedTime, materialsNeeded, steps.`,
        }),
      });
      const data = await res.json();
      // Try to parse json from reply
      const jsonMatch = data.reply?.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setCustomIdeas([...parsed, ...customIdeas]);
      } else {
        // Fallback custom project
        setCustomIdeas([
          {
            title: `Custom Upcycled ${customItemInput} Planter & Caddy`,
            difficulty: 'Easy',
            estimatedTime: '20 mins',
            materialsNeeded: [customItemInput, 'Scissors', 'Soil or pens'],
            steps: [
              `Clean and dry the ${customItemInput}.`,
              'Carefully cut opening at desired height.',
              'Smooth raw edges and repurpose for desktop supplies or succulents.',
            ],
          },
          ...customIdeas,
        ]);
      }
      setCustomItemInput('');
    } catch {
      // Fallback
    } finally {
      setGeneratingCustom(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>Zero-Waste Maker Space</span>
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">
            Upcycle Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Turn discarded single-use plastics into functional home planters, workshop tools, and decorative art. Complete a project to earn circular XP and master badges.
          </p>
        </div>

        {/* Studio Stats */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-lg font-mono font-bold text-emerald-400">
              {completedProjects.length}
            </div>
            <div className="text-[10px] text-slate-400">Projects Built</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-lg font-mono font-bold text-lime-400">
              +{completedProjects.length * 150} XP
            </div>
            <div className="text-[10px] text-slate-400">Upcycle Bonus</div>
          </div>
        </div>
      </div>

      {/* Custom Idea Generator Input */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={customItemInput}
            onChange={(e) => setCustomItemInput(e.target.value)}
            placeholder="Have a specific waste item? (e.g. 5L cooking oil jug, broken CD cases, plastic cutlery...)"
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-400"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustom()}
          />
        </div>
        <button
          onClick={handleGenerateCustom}
          disabled={generatingCustom || !customItemInput.trim()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-slate-950 text-xs font-bold shrink-0 transition disabled:opacity-50"
        >
          {generatingCustom ? 'Generating...' : 'Generate DIY Ideas'}
        </button>
      </div>

      {/* Difficulty Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Difficulty:
        </span>
        {(['All', 'Easy', 'Medium', 'Advanced'] as const).map((diff) => (
          <button
            key={diff}
            onClick={() => setFilterDifficulty(diff)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterDifficulty === diff
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project, idx) => {
          const isDone = completedProjects.includes(project.title);
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl bg-slate-900/70 border transition flex flex-col justify-between space-y-4 ${
                isDone
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : 'border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                      project.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : project.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {project.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {project.estimatedTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                  {project.title}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="text-[11px] font-semibold text-slate-400">Required Materials:</div>
                  <div className="flex flex-wrap gap-1">
                    {project.materialsNeeded.map((mat, mIdx) => (
                      <span
                        key={mIdx}
                        className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] border border-slate-800"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  View Step-by-Step
                </button>

                <button
                  onClick={() => handleComplete(project.title)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Completed (+150 XP)' : 'I Built This!'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step-by-Step Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
                  DIY Tutorial • {selectedProject.estimatedTime}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <strong className="text-slate-200">Tools & Materials:</strong>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.materialsNeeded.map((m, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <strong className="text-xs text-slate-200">Step-by-Step Instructions:</strong>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {selectedProject.steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{st}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleComplete(selectedProject.title);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 text-xs font-bold"
              >
                Mark Done (+150 XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
