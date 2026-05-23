const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'populate_db.php');
let content = fs.readFileSync(filePath, 'utf8');

const mappings = {
  // Power Tools
  'Cordless Drill 18V': '/IMG/PWR/Cordless Drill.jpg',
  'Angle Grinder 4"': '/IMG/PWR/Angle Grinder.jpg',
  'Circular Saw 1500W': '/IMG/PWR/Circular Saw.jpg',
  'Impact Driver': '/IMG/PWR/Impact Driver.jpg',
  'Rotary Hammer': '/IMG/PWR/Rotary Hammer.webp',
  'Jigsaw': '/IMG/PWR/Jigsaw.jpg',
  'Electric Planer': '/IMG/PWR/Electric Planer.jpg',
  'Heat Gun': '/IMG/PWR/Heat Gun.jpg',
  'Bench Grinder': '/IMG/PWR/Bench Grinder.jpg',
  'Air Compressor': '/IMG/PWR/Air Compressor.jpg',
  'Welding Machine': '/IMG/PWR/Welding Machine.jpg',
  'Chainsaw': '/IMG/PWR/Chainsaw.avif',
  'Orbital Sander': '/IMG/PWR/Orbital Sander.jpg',
  'Tile Cutter': '/IMG/PWR/Tile Cutter.jpg',
  'Pressure Washer': '/IMG/PWR/Pressure Washer.jpg',
  'Nail Gun': '/IMG/PWR/Nail Gun.jpg',
  'Demolition Hammer': '/IMG/PWR/Demolition Hammer.jpg',
  'Power Mixer': '/IMG/PWR/Power Mixer.jpg',
  'Concrete Vibrator': '/IMG/PWR/Concrete Vibrator.jpg',
  'Table Saw': '/IMG/PWR/Table Saw.jpg',

  // Electrical
  'Electrical Wire 2.0mm': '/IMG/ELE/Electrical Wire.jpg',
  'Circuit Breaker 20A': '/IMG/ELE/Circuit Breaker.jpg',
  'LED Bulb 12W': '/IMG/ELE/LED Bulb.jpg',
  'Extension Cord 10m': '/IMG/ELE/Extension Cord.jpg',
  'Electrical Tape Black': '/IMG/ELE/Electrical Tape.jpg',
  'Duplex Outlet': '/IMG/ELE/Duplex Outlet.jpg',
  'Light Switch 1-Gang': '/IMG/ELE/Light Switch.jpg',
  'Junction Box Octagonal': '/IMG/ELE/Junction Box.jpg',
  'Voltage Tester Pen': '/IMG/ELE/Voltage Tester.jpg',
  'Cartridge Fuse 10A': '/IMG/ELE/Fuse.jpg',
  'Conduit Pipe PVC 1/2"': '/IMG/ELE/Conduit Pipe.jpg',
  'Nylon Cable Ties (Pack)': '/IMG/ELE/Cable Tie.jpg',
  'Digital Multimeter': '/IMG/ELE/Multimeter.jpg',
  'Power Strip 6-Outlet': '/IMG/ELE/Power Strip.jpg',
  'Ceiling Lamp Fixture': '/IMG/ELE/Ceiling Lamp.jpg',
  'Fluorescent Tube 40W': '/IMG/ELE/Fluorescent Tube.jpg',
  'Doorbell Switch': '/IMG/ELE/Doorbell Switch.jpg',
  'Panel Board 6-Branch': '/IMG/ELE/Panel Board.jpg',
  'Ground Rod Copper': '/IMG/ELE/Ground Rod.jpg',
  'Wire Connector Screw-On': '/IMG/ELE/Wire Connector.jpg',

  // Plumbing
  'PVC Pipe 2"': '/IMG/PLU/PVC Pipe.jpg',
  'Pipe Elbow 90-Deg': '/IMG/PLU/Pipe Elbow.jpg',
  'Brass Ball Valve 1/2"': '/IMG/PLU/Ball Valve.jpg',
  'Stainless Water Faucet': '/IMG/PLU/Faucet.jpg',
  'Adjustable Shower Head': '/IMG/PLU/Shower Head.jpg',
  'Heavy Duty Pipe Wrench': '/IMG/PLU/Pipe Wrench.jpg',
  'Teflon Thread Tape': '/IMG/PLU/Teflon Tape.jpg',
  'Ceramic Toilet Bowl': '/IMG/PLU/Toilet Bowl.jpg',
  'Kitchen Sink Drainer': '/IMG/PLU/Sink Drain.jpg',
  'Reinforced Water Hose': '/IMG/PLU/Water Hose.jpg',
  'Metal Pipe Clamp': '/IMG/PLU/Pipe Clamp.jpg',
  'Flexible Hose Connector': '/IMG/PLU/Flexible Connector.jpg',
  'Booster Water Pump 1HP': '/IMG/PLU/Water Pump.jpg',
  'Septic Tank Cover Iron': '/IMG/PLU/Septic Tank Cover.jpg',
  'Plastic P-Trap 1-1/2"': '/IMG/PLU/P-Trap.jpg',
  'Brass Gate Valve 1"': '/IMG/PLU/Gate Valve.jpg',
  'Heavy Duty Pipe Cutter': '/IMG/PLU/Pipe Cutter.jpg',
  'Toilet Bidet Spray': '/IMG/PLU/Bidet Spray.jpg',
  'Stainless Floor Drain 4x4': '/IMG/PLU/Floor Drain.jpg',
  'Brass Water Meter 1/2"': '/IMG/PLU/Water Meter.jpg',

  // Construction
  'Premium Cement 40kg': '/IMG/CONS/Cement.jpg',
  'Concrete Hollow Blocks 4"': '/IMG/CONS/Hollow Blocks.jpg',
  'Crushed Gravel (Cubic Metre)': '/IMG/CONS/Gravel.jpg',
  'Washed Sand (Cubic Metre)': '/IMG/CONS/Sand.jpg',
  'Steel Deformed Bar 10mm': '/IMG/CONS/Steel Bar.jpg',
  'Marine Plywood 3/4"': '/IMG/CONS/Plywood.jpg',
  'Corrugated GI Sheet 8ft': '/IMG/CONS/GI Sheet.jpg',
  'Aluminum Step Ladder 8ft': '/IMG/CONS/Ladder.jpg',
  'Steel Wheelbarrow': '/IMG/CONS/Wheelbarrow.jpg',
  'H-Frame Scaffolding Set': '/IMG/CONS/Scaffolding.jpg',
  'Concrete Mixer 1-Bag': '/IMG/CONS/Concrete Mixer.jpg',
  'Steel Measuring Tape 8m': '/IMG/CONS/Measuring Tape.jpg',
  'Pointed Steel Shovel': '/IMG/CONS/Shovel.jpg',
  'Pointing Brick Trowel': '/IMG/CONS/Trowel.jpg',
  'Safety Hard Hat Yellow': '/IMG/CONS/Safety Helmet.jpg',
  'Tile Adhesive (25kg)': '/IMG/CONS/Tile Adhesive.jpg',
  'Masonry Club Hammer': '/IMG/CONS/Masonry Hammer.jpg',
  'Rebar Tie Wire #16 (Roll)': '/IMG/CONS/Rebar Tie Wire.jpg',
  'Chalk Line Reel Set': '/IMG/CONS/Chalk Line.jpg',
  'Concrete Nails 3" (Box)': '/IMG/CONS/Concrete Nail.jpg',

  // Fasteners
  'Wood Screws #8x1"': '/IMG/FAS/Wood Screw.jpg',
  'Concrete Screw Anchor': '/IMG/FAS/Concrete Screw.jpg',
  'Drywall Screws 1-1/4"': '/IMG/FAS/Drywall Screw.jpg',
  'Hex Bolt M10 x 50mm': '/IMG/FAS/Hex Bolt.jpg',
  'Hex Nut M10 Standard': '/IMG/FAS/Nut.jpg',
  'Flat Washer M10': '/IMG/FAS/Flat Washer.jpg',
  'Spring Lock Washer M10': '/IMG/FAS/Lock Washer.jpg',
  'Blind Rivet 3/16" (Box)': '/IMG/FAS/Rivet.jpg',
  'Sleeve Anchor Bolt 1/2"': '/IMG/FAS/Anchor Bolt.jpg',
  'Concrete Expansion Bolt': '/IMG/FAS/Expansion Bolt.jpg',
  'Galvanized U-Bolt M8': '/IMG/FAS/U-Bolt.jpg',
  'Self-Tapping Screw #10': '/IMG/FAS/Self-Tapping Screw.jpg',
  'Umbrella Roofing Nails': '/IMG/FAS/Roofing Nail.jpg',
  'Finishing Nails 1-1/2"': '/IMG/FAS/Finishing Nail.jpg',
  'Pneumatic Brad Nails': '/IMG/FAS/Brad Nail.jpg',
  'Steel Cotter Pin Set': '/IMG/FAS/Cotter Pin.jpg',
  'Threaded Rod 1m M12': '/IMG/FAS/Threaded Rod.jpg',
  'Heavy Duty Eye Bolt M12': '/IMG/FAS/Eye Bolt.jpg',
  'Spring Toggle Wing Bolt': '/IMG/FAS/Toggle Bolt.jpg',
  'Pan Head Machine Screws': '/IMG/FAS/Machine Screw.jpg'
};

let replacedCount = 0;

for (const [productName, localPath] of Object.entries(mappings)) {
  const escapedName = productName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(\\['P-\\d+',\\s*'${escapedName}',\\s*'[^']+',\\s*'[^']+',\\s*\\d+(?:\\.\\d+)?,\\s*\\d+(?:\\.\\d+)?,\\s*\\d+,\\s*\\d+,\\s*'[^']+',\\s*'[^']+',\\s*')https?:\\/\\/[^']+'(\\],?)`, 'g');
  
  if (regex.test(content)) {
    content = content.replace(regex, `$1${localPath}'$2`);
    replacedCount++;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully updated ${replacedCount} image paths in populate_db.php!`);
