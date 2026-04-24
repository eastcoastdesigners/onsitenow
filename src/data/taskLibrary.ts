import type { LibraryTask, TaskCategory } from '../types'

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  Framing:    '🪵',
  Demo:       '🔨',
  Tile:       '⬜',
  Flooring:   '🏠',
  Plumbing:   '🔧',
  Electrical: '⚡',
  Drywall:    '🧱',
  Paint:      '🖌️',
  Trim:       '📐',
  Roofing:    '🏗️',
  Concrete:   '🪨',
}

export const TASK_LIBRARY: LibraryTask[] = [
  // ── Framing ────────────────────────────────────────────────────────────────
  {
    id: 'lib-frame-01',
    category: 'Framing',
    name: 'Frame an Interior Partition Wall',
    description: 'Measure, snap chalk lines, and frame a new interior partition wall using 2×4 studs at 16" OC. Includes top plate, bottom plate, king studs, and headers.',
    estimatedMinutes: 90,
    videoId: 'bMdh-yKTfhI',
    searchQuery: 'how to frame an interior partition wall 2x4 studs 16 OC',
    toolsNeeded: ['Framing nailer', 'Circular saw', 'Level', 'Chalk line', 'Speed square', 'Tape measure', 'Stud finder', 'Hammer'],
    safetyNotes: 'Wear safety glasses and hearing protection. Verify no utilities in wall cavity before cutting. Check load-bearing status before removing any wall.',
  },
  {
    id: 'lib-frame-02',
    category: 'Framing',
    name: 'Install a Pre-Hung Door Frame',
    description: 'Set a pre-hung interior door in a rough opening: plumb the hinge side, shim both sides, nail off, and check swing. Trim shims flush.',
    estimatedMinutes: 60,
    videoId: 'xFUvBMlMBWk',
    searchQuery: 'how to install pre hung interior door frame plumb shim',
    toolsNeeded: ['Level', 'Shims', 'Finish nailer', 'Hammer', 'Utility knife', 'Pry bar', 'Tape measure'],
    safetyNotes: 'Use proper lifting technique for heavy door slabs. Secure door during installation so it cannot swing and pinch fingers.',
  },

  // ── Demo ───────────────────────────────────────────────────────────────────
  {
    id: 'lib-demo-01',
    category: 'Demo',
    name: 'Remove Drywall',
    description: 'Score and remove drywall from a designated area. Cut along studs, pull screws or nails, remove panels without damaging framing. Stack debris for disposal.',
    estimatedMinutes: 45,
    videoId: 'LPkMTMknhVA',
    searchQuery: 'how to demo remove drywall safely without damaging framing',
    toolsNeeded: ['Reciprocating saw', 'Utility knife', 'Pry bar', 'Hammer', 'Shop vac', 'Dumpster/bags'],
    safetyNotes: 'ALWAYS shut off electricity to area first and verify with tester. Wear N95 dust mask and safety glasses. Pre-1980 homes may have asbestos — test before demo.',
  },
  {
    id: 'lib-demo-02',
    category: 'Demo',
    name: 'Remove Ceramic Floor Tile',
    description: 'Break up and remove ceramic or porcelain floor tile using a floor scraper or jackhammer chisel. Chip up remaining mortar/mastic. Leave subfloor clean.',
    estimatedMinutes: 60,
    videoId: 'ld6-cMFcTk0',
    searchQuery: 'how to remove ceramic floor tile demo jackhammer chisel scraper',
    toolsNeeded: ['Floor scraper / chisel', 'Rotary hammer with chisel bit', 'Cold chisel', 'Safety glasses', 'Knee pads', 'Heavy gloves', 'Shop vac'],
    safetyNotes: 'Eye protection is critical — tile fragments fly. Knee pads required. Mastic in pre-1980 homes may contain asbestos — get tested before disturbing.',
  },

  // ── Tile ───────────────────────────────────────────────────────────────────
  {
    id: 'lib-tile-01',
    category: 'Tile',
    name: 'Install Ceramic Floor Tile',
    description: 'Dry-lay tile layout from center of room, mix and spread thinset with a notched trowel, set tile with spacers, check level after each row. Work in sections.',
    estimatedMinutes: 120,
    videoId: 'k6bQGtBCPTU',
    searchQuery: 'how to install ceramic floor tile thinset notched trowel layout',
    toolsNeeded: ['Tile saw (wet saw)', 'Notched trowel', 'Rubber mallet', 'Tile spacers', '4-ft level', 'Grout float', 'Chalk line', 'Knee pads'],
    safetyNotes: 'Wear safety glasses when cutting — tile shards are razor sharp. Use wet saw per manufacturer instructions. Kneepads required. Keep fingers clear of saw blade.',
  },
  {
    id: 'lib-tile-02',
    category: 'Tile',
    name: 'Grout Floor or Wall Tile',
    description: 'Mix unsanded or sanded grout to peanut butter consistency. Apply diagonally with grout float, pack joints fully, sponge off haze in stages. Buff dry.',
    estimatedMinutes: 60,
    videoId: 'JNJvBJE4mQE',
    searchQuery: 'how to grout floor tile apply float sponge haze',
    toolsNeeded: ['Grout float', 'Margin trowel', 'Two buckets', 'Sponge (large)', 'Grout', 'Sealer applicator'],
    safetyNotes: 'Wear rubber gloves — grout is highly alkaline and dries skin. Work in ventilated area when applying sealer. Do not mix grout near open drains.',
  },
  {
    id: 'lib-tile-03',
    category: 'Tile',
    name: 'Install Subway Tile Backsplash',
    description: 'Mark level reference line, apply mastic or thinset to wall, set 3×6 subway tile in offset brick pattern with 1/16" spacers. Cut border pieces on wet saw.',
    estimatedMinutes: 90,
    videoId: 'LJPWL7c4cEE',
    searchQuery: 'how to install subway tile backsplash kitchen wall offset pattern',
    toolsNeeded: ['Tile saw', 'Notched trowel (V-notch)', 'Level', 'Tile spacers', 'Grout float', 'Caulk gun', 'Pencil'],
    safetyNotes: 'Eye protection when cutting tile. Ensure power is off to any outlets in work area. Use mastic only for dry areas — use thinset behind showers.',
  },

  // ── Flooring ───────────────────────────────────────────────────────────────
  {
    id: 'lib-floor-01',
    category: 'Flooring',
    name: 'Install Luxury Vinyl Plank (LVP)',
    description: 'Acclimate planks 48 hrs. Undercut door jambs. Lay underlayment, click-lock planks starting from longest wall, maintain 1/4" expansion gap. Cut final row.',
    estimatedMinutes: 120,
    videoId: 'IfRmFRxKPdE',
    searchQuery: 'how to install luxury vinyl plank LVP click lock flooring',
    toolsNeeded: ['Utility knife / jigsaw', 'Pull bar', 'Tapping block', 'Rubber mallet', 'Spacers (1/4")', 'Tape measure', 'Speed square'],
    safetyNotes: 'Kneepads required. Gloves when handling planks with sharp edges. Do not install over subfloor with more than 3/16" per 10 ft variance — flatten first.',
  },
  {
    id: 'lib-floor-02',
    category: 'Flooring',
    name: 'Install Laminate Flooring',
    description: 'Acclimate 48 hrs. Lay foam underlayment, stagger joints minimum 12". Click planks together, tap with tapping block, leave 1/2" expansion gap at all walls.',
    estimatedMinutes: 120,
    videoId: 'jD-hUMzb1oU',
    searchQuery: 'how to install laminate flooring click lock stagger joints',
    toolsNeeded: ['Circular saw / jigsaw', 'Pull bar', 'Tapping block', 'Rubber mallet', 'Spacers', 'Tape measure', 'Foam underlayment'],
    safetyNotes: 'Eye and ear protection when cutting with circular saw. Never install over wet subfloor — moisture causes laminate to swell and buckle.',
  },

  // ── Plumbing ───────────────────────────────────────────────────────────────
  {
    id: 'lib-plumb-01',
    category: 'Plumbing',
    name: 'Install a Toilet',
    description: 'Set new wax ring on flange, lower toilet straight down, press firmly, hand-tighten bolts evenly. Connect supply line, check for leaks, caulk base.',
    estimatedMinutes: 45,
    videoId: '7tCiXHPOCws',
    searchQuery: 'how to install toilet wax ring flange supply line',
    toolsNeeded: ['Adjustable wrench', 'Level', 'Wax ring kit', 'Hacksaw', 'Bucket', 'Towels', 'Gloves'],
    safetyNotes: 'Turn off water supply valve fully and flush before starting. Place towels to catch residual water. Toilets are heavy — use two people or a toilet lifter. Wear gloves.',
  },
  {
    id: 'lib-plumb-02',
    category: 'Plumbing',
    name: 'Replace a Sink Drain P-Trap',
    description: 'Place bucket under trap, loosen slip-joint nuts by hand or with pliers, remove old P-trap, clean pipe ends, install new trap and hand-tighten. Test for leaks.',
    estimatedMinutes: 30,
    videoId: 'Jlw_WStN8ME',
    searchQuery: 'how to replace sink drain P-trap slip joint plumbing',
    toolsNeeded: ['Slip-joint pliers', 'Bucket', 'Replacement P-trap kit', 'Plumber\'s tape', 'Gloves'],
    safetyNotes: 'Have bucket ready before loosening — water and debris will fall. Wear gloves. Do not overtighten plastic slip-joint nuts — finger-tight plus 1/4 turn.',
  },

  // ── Electrical ─────────────────────────────────────────────────────────────
  {
    id: 'lib-elec-01',
    category: 'Electrical',
    name: 'Install a GFCI Outlet',
    description: 'Trip breaker, verify dead with tester, remove old outlet, connect LINE wires to GFCI terminals (black→hot, white→neutral, ground), mount, test GFCI function.',
    estimatedMinutes: 30,
    videoId: 'fXRJNfBfr6A',
    searchQuery: 'how to install GFCI outlet replace wiring line load terminals',
    toolsNeeded: ['Non-contact voltage tester', 'Flathead + Phillips screwdriver', 'Wire stripper', 'Needle-nose pliers', 'Electrical tape'],
    safetyNotes: '⚡ CRITICAL: Turn off breaker AND verify circuit is dead with a non-contact tester before touching any wires. NEVER work on a live circuit. If unsure, call a licensed electrician.',
  },
  {
    id: 'lib-elec-02',
    category: 'Electrical',
    name: 'Install a Ceiling Light Fixture',
    description: 'Turn off breaker and verify dead. Remove old fixture. Connect wires (black to black, white to white, bare/green to ground). Mount new fixture to junction box. Test.',
    estimatedMinutes: 45,
    videoId: 'hFB8pFjAp4Y',
    searchQuery: 'how to install ceiling light fixture replace wiring junction box',
    toolsNeeded: ['Non-contact voltage tester', 'Screwdrivers', 'Wire connectors (wire nuts)', 'Ladder', 'Electrical tape'],
    safetyNotes: '⚡ CRITICAL: Turn off breaker AND verify with voltage tester before touching wires. Use a stable, rated ladder. Never stand on top two steps of a step ladder.',
  },

  // ── Drywall ────────────────────────────────────────────────────────────────
  {
    id: 'lib-dry-01',
    category: 'Drywall',
    name: 'Hang Drywall Sheets',
    description: 'Hang 4×8 or 4×12 sheets horizontally, stagger seams, drive screws 12" OC in field and 8" OC on edges. Keep screws 3/8" from edges. Start from top down.',
    estimatedMinutes: 90,
    videoId: 'JeSKi_f5IHI',
    searchQuery: 'how to hang drywall sheets screw spacing horizontal installation',
    toolsNeeded: ['Drywall lift (or 2nd person)', 'Cordless drill/driver', 'Drywall screws', 'T-square', 'Utility knife', 'Tape measure', 'Screw setter bit'],
    safetyNotes: 'Never hang drywall alone — panels are heavy and awkward. Dust mask required. Watch for electrical boxes — cut them out before hanging. Wear back support.',
  },
  {
    id: 'lib-dry-02',
    category: 'Drywall',
    name: 'Tape and Mud Drywall Seams',
    description: 'Coat 1: embed paper tape in mud on seams and inside corners; feather to 4". Coat 2 (next day): 6" knife, feather to 8". Coat 3: 10" knife, feather to 12". Sand smooth.',
    estimatedMinutes: 60,
    videoId: 'TW0gWiMJOgM',
    searchQuery: 'how to tape mud drywall seams three coat feather sand',
    toolsNeeded: ['6", 8", 10" drywall knives', 'Corner bead', 'Mud pan', 'All-purpose joint compound', 'Paper tape', 'Pole sander', 'Dust mask'],
    safetyNotes: 'Wear N95 dust mask when sanding — drywall dust is extremely fine and harmful to lungs. Ventilate the room. Sand with water if possible to reduce airborne dust.',
  },

  // ── Paint ──────────────────────────────────────────────────────────────────
  {
    id: 'lib-paint-01',
    category: 'Paint',
    name: 'Prep and Roll Interior Walls',
    description: 'Lay drop cloths, tape trim, fill holes with spackle, sand smooth, wipe dust. Prime bare patches. Cut in ceiling and trim line with brush. Roll walls in W pattern.',
    estimatedMinutes: 90,
    videoId: 'hHcBrVPdmqk',
    searchQuery: 'how to prep and roll paint interior walls W pattern roller technique',
    toolsNeeded: ['9" roller frame + cover', 'Roller pan', '2" angled brush', 'Drop cloths', 'Painter\'s tape', 'Spackle + putty knife', 'Sandpaper (120-grit)', 'Caulk gun'],
    safetyNotes: 'Ventilate room when painting — open windows and run a fan. Wear safety glasses to prevent paint drips in eyes. Use rated ladder; never overreach.',
  },
  {
    id: 'lib-paint-02',
    category: 'Paint',
    name: 'Cut In Paint Along Trim and Ceiling',
    description: 'Load an angled 2" brush, remove excess, paint a straight line along trim and ceiling using the brush tip. Work in 18" sections. Keep wet edge going.',
    estimatedMinutes: 45,
    videoId: '8i3H-hXvEiA',
    searchQuery: 'how to cut in paint straight line ceiling trim brush technique',
    toolsNeeded: ['2" angled sash brush', 'Paint pail with bucket hook', 'Painter\'s tape (for protection)', 'Drop cloth', 'Damp rag for drips'],
    safetyNotes: 'Use a stable stepladder positioned close to work — never lean a straight ladder against a wall while painting. Keep paint off eyes and skin.',
  },

  // ── Trim ───────────────────────────────────────────────────────────────────
  {
    id: 'lib-trim-01',
    category: 'Trim',
    name: 'Install Baseboard Trim',
    description: 'Find studs, measure and miter-cut baseboard for inside/outside corners. Nail to studs and bottom plate with finish nailer, caulk gaps, fill nail holes, touch-up paint.',
    estimatedMinutes: 60,
    videoId: '2Tm5QbJITaI',
    searchQuery: 'how to install baseboard trim miter cut inside outside corners nailer',
    toolsNeeded: ['Miter saw', 'Brad nailer / finish nailer', '15ga or 16ga nails', 'Level', 'Stud finder', 'Tape measure', 'Caulk gun', 'Wood filler'],
    safetyNotes: 'Miter saw: keep guard in place, never reach over blade, keep hands 6" clear of blade. Hearing and eye protection required.',
  },

  // ── Roofing ────────────────────────────────────────────────────────────────
  {
    id: 'lib-roof-01',
    category: 'Roofing',
    name: 'Install Asphalt Shingles',
    description: 'Nail starter strip flush with eave. Snap chalk lines every 5" exposure. Offset shingle joints 6" per row. Nail 4 nails per shingle in nail zone. Seal ridge last.',
    estimatedMinutes: 120,
    videoId: '7DqeCtOaHek',
    searchQuery: 'how to install asphalt shingles starter strip exposure offset nailing',
    toolsNeeded: ['Roofing nailer', 'Chalk line', 'Utility knife + hook blade', 'Pry bar', 'Hammer', 'Tape measure', 'Safety harness + ridge anchor'],
    safetyNotes: '⚠️ FALL HAZARD: OSHA-required fall protection above 6 ft. Always use a harness anchored to ridge. NEVER work on a wet, icy, or moss-covered roof. Wear rubber-soled boots.',
  },

  // ── Concrete ───────────────────────────────────────────────────────────────
  {
    id: 'lib-conc-01',
    category: 'Concrete',
    name: 'Mix and Pour Concrete Footings',
    description: 'Dig footing below frost line, set form boards level. Mix concrete to stiff consistency, pour in 6" lifts, rod to remove voids, screed level, float surface.',
    estimatedMinutes: 90,
    videoId: 'Dkv7B6XTMHM',
    searchQuery: 'how to mix pour concrete footings form boards screed float',
    toolsNeeded: ['Concrete mixer or wheelbarrow', 'Concrete rake', 'Shovel', 'Screed board', 'Float', 'Level', 'Form boards + stakes', 'Rebar + wire ties'],
    safetyNotes: 'Wear waterproof rubber gloves and rubber boots — wet concrete is highly alkaline and causes chemical burns to skin. Eye protection required. Rinse any skin contact immediately with water.',
  },
]

export const CATEGORIES = Array.from(new Set(TASK_LIBRARY.map(t => t.category))) as TaskCategory[]

export function getTasksByCategory(category: TaskCategory): LibraryTask[] {
  return TASK_LIBRARY.filter(t => t.category === category)
}
