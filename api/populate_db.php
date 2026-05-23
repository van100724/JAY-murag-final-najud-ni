<?php
require_once 'db.php';
handleCors();

header('Content-Type: application/json');

try {
    // 1. Disable Foreign Key Checks to Truncate Cleanly
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("TRUNCATE TABLE alerts;");
    $pdo->exec("TRUNCATE TABLE sale_items;");
    $pdo->exec("TRUNCATE TABLE sales;");
    $pdo->exec("TRUNCATE TABLE products;");
    $pdo->exec("TRUNCATE TABLE suppliers;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    $pdo->beginTransaction();

    // 2. Define Suppliers for each Category
    $suppliers = [
        ['SUP-001', 'Titan PowerTools Inc.', 'Jose Rizal', 'jose.rizal@titanpowertools.ph', '+63 917 123 4567', '123 Rizal Ave', 'Manila', 'NCR', '1000', 'Philippines', 'Net30', 'Power Tools', 'active', 4.80, 3],
        ['SUP-002', 'Lumina Electrical Supplies', 'Emilio Aguinaldo', 'emilio.a@luminaelectrical.ph', '+63 920 456 7890', '101 Aguinaldo Hwy', 'Cavite City', 'Cavite', '4100', 'Philippines', 'Net60', 'Electrical', 'active', 4.20, 4],
        ['SUP-003', 'FlowTech Plumbing Solutions', 'Juan Luna', 'juan.luna@flowtechplumbing.ph', '+63 919 345 6789', '789 Luna Blvd', 'Cebu City', 'Cebu', '6000', 'Philippines', 'Net30', 'Plumbing', 'active', 4.90, 2],
        ['SUP-004', 'BuildPro Construction Materials', 'Andres Bonifacio', 'andres.b@buildpromaterials.ph', '+63 918 234 5678', '456 Bonifacio St', 'Quezon City', 'NCR', '1100', 'Philippines', 'COD', 'Construction', 'active', 4.50, 5],
        ['SUP-005', 'SecureFast Industrial Fasteners', 'Gabriela Silang', 'gabriela.s@securefast.ph', '+63 922 678 9012', '303 Silang Way', 'Vigan City', 'Ilocos Sur', '2700', 'Philippines', 'Net30', 'Fasteners', 'active', 4.75, 2],
        ['SUP-006', 'ColorTech Paints & Coatings', 'Apolinario Mabini', 'apolinario.m@colortechpaints.ph', '+63 921 567 8901', '202 Mabini St', 'Davao City', 'Davao del Sur', '8000', 'Philippines', 'Net30', 'Painting', 'active', 4.60, 3]
    ];

    $supSql = "INSERT INTO suppliers 
        (id, name, contact_person, email, phone, address, city, state, zip_code, country, payment_terms, category, status, rating, average_delivery_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $supStmt = $pdo->prepare($supSql);
    foreach ($suppliers as $sup) {
        $supStmt->execute($sup);
    }

    // 3. Define 120 Products (20 per category)
    // Format: [id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image]
    $products = [
        // Category 1: Power Tools (Titan PowerTools Inc.)
        ['P-001', 'Cordless Drill 18V', 'PWR-DRL-001', 'Power Tools', 3500.00, 2200.00, 45, 10, 'Titan PowerTools Inc.', 'High-torque 18V cordless drill with 2.0Ah battery pack', '/IMG/PWR/Cordless Drill.jpg'],
        ['P-002', 'Angle Grinder 4"', 'PWR-GRN-002', 'Power Tools', 2800.00, 1800.00, 32, 10, 'Titan PowerTools Inc.', 'Professional 900W angle grinder with safety guard', '/IMG/PWR/Angle Grinder.jpg'],
        ['P-003', 'Circular Saw 1500W', 'PWR-SAW-003', 'Power Tools', 4500.00, 3100.00, 18, 5, 'Titan PowerTools Inc.', 'Heavy duty circular saw with laser guide and rip fence', '/IMG/PWR/Circular Saw.jpg'],
        ['P-004', 'Impact Driver', 'PWR-IMP-004', 'Power Tools', 3900.00, 2600.00, 25, 8, 'Titan PowerTools Inc.', 'Compact brushless impact driver with variable speed trigger', '/IMG/PWR/Impact Driver.jpg'],
        ['P-005', 'Rotary Hammer', 'PWR-HAM-005', 'Power Tools', 5200.00, 3600.00, 15, 5, 'Titan PowerTools Inc.', '3-mode SDS Plus rotary hammer for heavy concrete work', '/IMG/PWR/Rotary Hammer.webp'],
        ['P-006', 'Jigsaw', 'PWR-JIG-006', 'Power Tools', 2400.00, 1600.00, 3, 10, 'Titan PowerTools Inc.', 'Orbital jigsaw with tool-free blade change', '/IMG/PWR/Jigsaw.jpg'], // Trigger Low Stock (3 <= 10)
        ['P-007', 'Electric Planer', 'PWR-PLN-007', 'Power Tools', 3100.00, 2100.00, 20, 5, 'Titan PowerTools Inc.', 'High speed electric wood planer with adjustable depth', '/IMG/PWR/Electric Planer.jpg'],
        ['P-008', 'Heat Gun', 'PWR-GUN-008', 'Power Tools', 1500.00, 950.00, 28, 5, 'Titan PowerTools Inc.', 'Dual temperature heat gun for stripping paint and vinyl wrap', '/IMG/PWR/Heat Gun.jpg'],
        ['P-009', 'Bench Grinder', 'PWR-BCH-009', 'Power Tools', 3600.00, 2400.00, 14, 5, 'Titan PowerTools Inc.', 'Heavy duty bench grinder with coarse and fine abrasive wheels', '/IMG/PWR/Bench Grinder.jpg'],
        ['P-010', 'Air Compressor', 'PWR-CMP-010', 'Power Tools', 8500.00, 6000.00, 8, 3, 'Titan PowerTools Inc.', 'Oil-free silent air compressor with 24L steel tank', '/IMG/PWR/Air Compressor.jpg'],
        ['P-011', 'Welding Machine', 'PWR-WLD-011', 'Power Tools', 6200.00, 4200.00, 12, 5, 'Titan PowerTools Inc.', 'Portable IGBT inverter welding machine, 200A output', '/IMG/PWR/Welding Machine.jpg'],
        ['P-012', 'Chainsaw', 'PWR-CHN-012', 'Power Tools', 7800.00, 5400.00, 6, 3, 'Titan PowerTools Inc.', 'Gasoline-powered chainsaw with 18-inch Oregon bar', '/IMG/PWR/Chainsaw.avif'],
        ['P-013', 'Orbital Sander', 'PWR-SND-013', 'Power Tools', 2200.00, 1450.00, 22, 8, 'Titan PowerTools Inc.', 'Random orbital sander with efficient dust extraction box', '/IMG/PWR/Orbital Sander.jpg'],
        ['P-014', 'Tile Cutter', 'PWR-CUT-014', 'Power Tools', 4100.00, 2800.00, 10, 5, 'Titan PowerTools Inc.', 'Professional manual tile cutter with laser alignment guide', '/IMG/PWR/Tile Cutter.jpg'],
        ['P-015', 'Pressure Washer', 'PWR-WSH-015', 'Power Tools', 5600.00, 3900.00, 19, 5, 'Titan PowerTools Inc.', 'High pressure washer 130 bar with adjustable spray wand', '/IMG/PWR/Pressure Washer.jpg'],
        ['P-016', 'Nail Gun', 'PWR-NIL-016', 'Power Tools', 3800.00, 2500.00, 2, 5, 'Titan PowerTools Inc.', 'Pneumatic brad nailer with adjustable depth drive', '/IMG/PWR/Nail Gun.jpg'], // Trigger Low Stock (2 <= 5)
        ['P-017', 'Demolition Hammer', 'PWR-DEM-017', 'Power Tools', 9500.00, 6800.00, 5, 2, 'Titan PowerTools Inc.', 'Heavy demolition breaker hammer with carry case', '/IMG/PWR/Demolition Hammer.jpg'],
        ['P-018', 'Power Mixer', 'PWR-MIX-018', 'Power Tools', 3300.00, 2200.00, 11, 4, 'Titan PowerTools Inc.', 'Handheld electric mixer for paint, plaster, and mortar', '/IMG/PWR/Power Mixer.jpg'],
        ['P-019', 'Concrete Vibrator', 'PWR-VIB-019', 'Power Tools', 4800.00, 3200.00, 7, 3, 'Titan PowerTools Inc.', 'Portable concrete vibrator with 1.5m flexible shaft', '/IMG/PWR/Concrete Vibrator.jpg'],
        ['P-020', 'Table Saw', 'PWR-TBL-020', 'Power Tools', 12500.00, 8900.00, 4, 3, 'Titan PowerTools Inc.', '10-inch table saw with folding stand and carbide blade', '/IMG/PWR/Table Saw.jpg'],

        // Category 2: Electrical (Lumina Electrical Supplies)
        ['P-021', 'Electrical Wire 2.0mm', 'ELE-WRE-001', 'Electrical', 2400.00, 1700.00, 80, 20, 'Lumina Electrical Supplies', 'Stranded copper THHN electrical wire, 150-meter roll', '/IMG/ELE/Electrical Wire.jpg'],
        ['P-022', 'Circuit Breaker 20A', 'ELE-BRK-002', 'Electrical', 450.00, 280.00, 120, 30, 'Lumina Electrical Supplies', 'Single-pole plug-in circuit breaker, 20-ampere rating', '/IMG/ELE/Circuit Breaker.jpg'],
        ['P-023', 'LED Bulb 12W', 'ELE-BLB-003', 'Electrical', 150.00, 90.00, 300, 50, 'Lumina Electrical Supplies', 'Energy efficient 12W daylight LED bulb, E27 base', '/IMG/ELE/LED Bulb.jpg'],
        ['P-024', 'Extension Cord 10m', 'ELE-EXT-004', 'Electrical', 650.00, 420.00, 40, 15, 'Lumina Electrical Supplies', 'Heavy duty extension cord with 3-way grounded outlet', '/IMG/ELE/Extension Cord.jpg'],
        ['P-025', 'Electrical Tape Black', 'ELE-TPE-005', 'Electrical', 35.00, 18.00, 500, 100, 'Lumina Electrical Supplies', 'Premium PVC electrical insulation tape, black roll', '/IMG/ELE/Electrical Tape.jpg'],
        ['P-026', 'Duplex Outlet', 'ELE-OUT-006', 'Electrical', 180.00, 110.00, 90, 25, 'Lumina Electrical Supplies', 'Wall duplex socket outlet with grounding terminal', '/IMG/ELE/Duplex Outlet.jpg'],
        ['P-027', 'Light Switch 1-Gang', 'ELE-SWT-007', 'Electrical', 120.00, 75.00, 100, 25, 'Lumina Electrical Supplies', 'Single-gang plate light switch, modern profile', '/IMG/ELE/Light Switch.jpg'],
        ['P-028', 'Junction Box Octagonal', 'ELE-BOX-008', 'Electrical', 45.00, 25.00, 250, 50, 'Lumina Electrical Supplies', 'Octagonal utility junction box, heavy duty plastic', '/IMG/ELE/Junction Box.jpg'],
        ['P-029', 'Voltage Tester Pen', 'ELE-TST-009', 'Electrical', 250.00, 150.00, 3, 10, 'Lumina Electrical Supplies', 'Non-contact AC voltage tester pen with audio/visual alert', '/IMG/ELE/Voltage Tester.jpg'], // Trigger Low Stock (3 <= 10)
        ['P-030', 'Cartridge Fuse 10A', 'ELE-FUS-010', 'Electrical', 20.00, 10.00, 180, 40, 'Lumina Electrical Supplies', 'Glass cartridge fuse, 10-amp limit, package of 5', '/IMG/ELE/Fuse.jpg'],
        ['P-031', 'Conduit Pipe PVC 1/2"', 'ELE-PIP-011', 'Electrical', 150.00, 95.00, 140, 30, 'Lumina Electrical Supplies', 'Rigid PVC conduit pipe, 10-foot length', '/IMG/ELE/Conduit Pipe.jpg'],
        ['P-032', 'Nylon Cable Ties (Pack)', 'ELE-TIE-012', 'Electrical', 80.00, 45.00, 300, 50, 'Lumina Electrical Supplies', 'Pack of 100 industrial grade black nylon zip ties', '/IMG/ELE/Cable Tie.jpg'],
        ['P-033', 'Digital Multimeter', 'ELE-MUL-013', 'Electrical', 1200.00, 750.00, 15, 5, 'Lumina Electrical Supplies', 'Auto-ranging digital multimeter with back-lit LCD screen', '/IMG/ELE/Multimeter.jpg'],
        ['P-034', 'Power Strip 6-Outlet', 'ELE-STP-014', 'Electrical', 480.00, 300.00, 45, 15, 'Lumina Electrical Supplies', '6-outlet power strip with surge protection and overload switch', '/IMG/ELE/Power Strip.jpg'],
        ['P-035', 'Ceiling Lamp Fixture', 'ELE-LMP-015', 'Electrical', 850.00, 550.00, 22, 8, 'Lumina Electrical Supplies', 'Round surface mount ceiling light fixture, E27 socket', '/IMG/ELE/Ceiling Lamp.jpg'],
        ['P-036', 'Fluorescent Tube 40W', 'ELE-TUB-016', 'Electrical', 180.00, 110.00, 60, 20, 'Lumina Electrical Supplies', 'T8 fluorescent tube light, daylight color temperature', '/IMG/ELE/Fluorescent Tube.jpg'],
        ['P-037', 'Doorbell Switch', 'ELE-DRB-017', 'Electrical', 140.00, 85.00, 50, 15, 'Lumina Electrical Supplies', 'Illuminated doorbell press button, wall mount', '/IMG/ELE/Doorbell Switch.jpg'],
        ['P-038', 'Panel Board 6-Branch', 'ELE-PNL-018', 'Electrical', 3500.00, 2300.00, 12, 4, 'Lumina Electrical Supplies', 'Load center distribution panel board, 6 branches, indoor', '/IMG/ELE/Panel Board.jpg'],
        ['P-039', 'Ground Rod Copper', 'ELE-ROD-019', 'Electrical', 450.00, 290.00, 1, 5, 'Lumina Electrical Supplies', 'Solid copper ground rod for safety grounding systems, 5ft', '/IMG/ELE/Ground Rod.jpg'], // Trigger Low Stock (1 <= 5)
        ['P-040', 'Wire Connector Screw-On', 'ELE-CON-020', 'Electrical', 90.00, 50.00, 400, 100, 'Lumina Electrical Supplies', 'Screw-on wire connector wire nuts, box of 100', '/IMG/ELE/Wire Connector.jpg'],

        // Category 3: Plumbing (FlowTech Plumbing Solutions)
        ['P-041', 'PVC Pipe 2"', 'PLU-PIP-001', 'Plumbing', 280.00, 180.00, 160, 30, 'FlowTech Plumbing Solutions', 'Blue sanitary PVC pipe, 10-foot length, 2-inch diameter', '/IMG/PLU/PVC Pipe.jpg'],
        ['P-042', 'Pipe Elbow 90-Deg', 'PLU-ELB-002', 'Plumbing', 25.00, 15.00, 500, 100, 'FlowTech Plumbing Solutions', 'PVC 90-degree pipe elbow connector for water lines', '/IMG/PLU/Pipe Elbow.jpg'],
        ['P-043', 'Brass Ball Valve 1/2"', 'PLU-VLV-003', 'Plumbing', 180.00, 110.00, 75, 20, 'FlowTech Plumbing Solutions', 'Heavy-duty brass ball valve thread shut-off controller', '/IMG/PLU/Ball Valve.jpg'],
        ['P-044', 'Stainless Water Faucet', 'PLU-FCT-004', 'Plumbing', 450.00, 280.00, 85, 20, 'FlowTech Plumbing Solutions', 'Chrome finish single-lever wall mount kitchen faucet', '/IMG/PLU/Faucet.jpg'],
        ['P-045', 'Adjustable Shower Head', 'PLU-SHW-005', 'Plumbing', 850.00, 520.00, 35, 10, 'FlowTech Plumbing Solutions', '3-way spray pattern overhead wall-mount shower head', '/IMG/PLU/Shower Head.jpg'],
        ['P-046', 'Heavy Duty Pipe Wrench', 'PLU-WRN-006', 'Plumbing', 750.00, 480.00, 18, 5, 'FlowTech Plumbing Solutions', 'Professional grade heavy steel pipe wrench tool, 14"', '/IMG/PLU/Pipe Wrench.jpg'],
        ['P-047', 'Teflon Thread Tape', 'PLU-TPE-007', 'Plumbing', 20.00, 10.00, 600, 100, 'FlowTech Plumbing Solutions', 'Professional quality thread sealing Teflon tape, 1/2" x 10m', '/IMG/PLU/Teflon Tape.jpg'],
        ['P-048', 'Ceramic Toilet Bowl', 'PLU-TOL-008', 'Plumbing', 4500.00, 3100.00, 12, 5, 'FlowTech Plumbing Solutions', 'High grade dual flush ceramic toilet bowl assembly', '/IMG/PLU/Toilet Bowl.jpg'],
        ['P-049', 'Kitchen Sink Drainer', 'PLU-DRN-009', 'Plumbing', 320.00, 200.00, 40, 10, 'FlowTech Plumbing Solutions', 'Stainless steel kitchen sink basket strainer assembly', '/IMG/PLU/Sink Drain.jpg'],
        ['P-050', 'Reinforced Water Hose', 'PLU-HSE-010', 'Plumbing', 550.00, 350.00, 4, 15, 'FlowTech Plumbing Solutions', 'Heavy-duty braided reinforcing water hose, 15m length', '/IMG/PLU/Water Hose.jpg'], // Trigger Low Stock (4 <= 15)
        ['P-051', 'Metal Pipe Clamp', 'PLU-CLP-011', 'Plumbing', 40.00, 22.00, 300, 50, 'FlowTech Plumbing Solutions', 'Galvanized iron hose pipe U-clamps, pack of 10', '/IMG/PLU/Pipe Clamp.jpg'],
        ['P-052', 'Flexible Hose Connector', 'PLU-FLX-012', 'Plumbing', 150.00, 90.00, 95, 20, 'FlowTech Plumbing Solutions', 'Braided stainless steel flexible faucet connector pipe', '/IMG/PLU/Flexible Connector.jpg'],
        ['P-053', 'Booster Water Pump 1HP', 'PLU-PMP-013', 'Plumbing', 4800.00, 3300.00, 9, 3, 'FlowTech Plumbing Solutions', '1HP electric domestic automatic water booster pump', '/IMG/PLU/Water Pump.jpg'],
        ['P-054', 'Septic Tank Cover Iron', 'PLU-STC-014', 'Plumbing', 1200.00, 800.00, 6, 3, 'FlowTech Plumbing Solutions', 'Heavy duty cast iron septic tank manhole cover', '/IMG/PLU/Septic Tank Cover.jpg'],
        ['P-055', 'Plastic P-Trap 1-1/2"', 'PLU-PTR-015', 'Plumbing', 110.00, 70.00, 110, 20, 'FlowTech Plumbing Solutions', 'Plastic adjustable sink drain waste trap P-trap fixture', '/IMG/PLU/P-Trap.jpg'],
        ['P-056', 'Brass Gate Valve 1"', 'PLU-GTV-016', 'Plumbing', 280.00, 170.00, 48, 12, 'FlowTech Plumbing Solutions', 'Full port brass gate valve for fluid flow control, 1 inch', '/IMG/PLU/Gate Valve.jpg'],
        ['P-057', 'Heavy Duty Pipe Cutter', 'PLU-CUT-017', 'Plumbing', 650.00, 410.00, 15, 5, 'FlowTech Plumbing Solutions', 'Handheld copper and aluminum tubing rotary cutter', '/IMG/PLU/Pipe Cutter.jpg'],
        ['P-058', 'Toilet Bidet Spray', 'PLU-BID-018', 'Plumbing', 380.00, 240.00, 55, 15, 'FlowTech Plumbing Solutions', 'Handheld sanitary bidet toilet spray nozzle with hose', '/IMG/PLU/Bidet Spray.jpg'],
        ['P-059', 'Stainless Floor Drain 4x4', 'PLU-FLR-019', 'Plumbing', 150.00, 95.00, 200, 30, 'FlowTech Plumbing Solutions', 'Anti-odor stainless steel bathroom floor waste grate drainer', '/IMG/PLU/Floor Drain.jpg'],
        ['P-060', 'Brass Water Meter 1/2"', 'PLU-MTR-020', 'Plumbing', 1850.00, 1200.00, 2, 5, 'FlowTech Plumbing Solutions', 'Certified residential dry dial rotary vane water flow meter', '/IMG/PLU/Water Meter.jpg'], // Trigger Low Stock (2 <= 5)

        // Category 4: Construction (BuildPro Construction Materials)
        ['P-061', 'Premium Cement 40kg', 'CON-CMT-001', 'Construction', 285.00, 240.00, 500, 100, 'BuildPro Construction Materials', 'Standard Type 1P Portland cement bag, 40 kilograms', '/IMG/CONS/Cement.jpg'],
        ['P-062', 'Concrete Hollow Blocks 4"', 'CON-BLK-002', 'Construction', 15.00, 11.00, 3000, 500, 'BuildPro Construction Materials', 'Standard concrete hollow blocks for partitioning walls', '/IMG/CONS/Hollow Blocks.jpg'],
        ['P-063', 'Crushed Gravel (Cubic Metre)', 'CON-GRV-003', 'Construction', 1200.00, 900.00, 50, 10, 'BuildPro Construction Materials', 'High quality 3/4 aggregate crushed gravel for concrete mixes', '/IMG/CONS/Gravel.jpg'],
        ['P-064', 'Washed Sand (Cubic Metre)', 'CON-SND-004', 'Construction', 1000.00, 750.00, 60, 10, 'BuildPro Construction Materials', 'Clean washed construction sand for plastering and concrete', '/IMG/CONS/Sand.jpg'],
        ['P-065', 'Steel Deformed Bar 10mm', 'CON-BAR-005', 'Construction', 220.00, 160.00, 800, 150, 'BuildPro Construction Materials', '10mm x 6m grade 33 structural steel deformed rebar', '/IMG/CONS/Steel Bar.jpg'],
        ['P-066', 'Marine Plywood 3/4"', 'CON-WD-006', 'Construction', 750.00, 580.00, 95, 20, 'BuildPro Construction Materials', 'Waterproof marine plywood board, 4ft x 8ft x 18mm', '/IMG/CONS/Plywood.jpg'],
        ['P-067', 'Corrugated GI Sheet 8ft', 'CON-GIS-007', 'Construction', 480.00, 360.00, 120, 25, 'BuildPro Construction Materials', 'Galvanized iron roofing corrugated sheet, Gauge 26, 8ft', '/IMG/CONS/GI Sheet.jpg'],
        ['P-068', 'Aluminum Step Ladder 8ft', 'CON-LDR-008', 'Construction', 2500.00, 1700.00, 2, 5, 'BuildPro Construction Materials', 'Folding aluminum A-frame step ladder, 8 feet height', '/IMG/CONS/Ladder.jpg'], // Trigger Low Stock (2 <= 5)
        ['P-069', 'Steel Wheelbarrow', 'CON-WHL-009', 'Construction', 2800.00, 1900.00, 14, 5, 'BuildPro Construction Materials', 'Deep-dish steel tray barrow with pneumatic rubber tyre', '/IMG/CONS/Wheelbarrow.jpg'],
        ['P-070', 'H-Frame Scaffolding Set', 'CON-SCA-010', 'Construction', 3500.00, 2400.00, 25, 5, 'BuildPro Construction Materials', 'Heavy steel scaffolding H-frame set with cross brace', '/IMG/CONS/Scaffolding.jpg'],
        ['P-071', 'Concrete Mixer 1-Bag', 'CON-MIX-011', 'Construction', 18000.00, 13500.00, 4, 3, 'BuildPro Construction Materials', 'Mobile gasoline engine cement mixer, 1-bag capacity', '/IMG/CONS/Concrete Mixer.jpg'],
        ['P-072', 'Steel Measuring Tape 8m', 'CON-TPE-012', 'Construction', 180.00, 110.00, 75, 15, 'BuildPro Construction Materials', 'Ergonomic rubber encased 8-meter steel tape measure', '/IMG/CONS/Measuring Tape.jpg'],
        ['P-073', 'Pointed Steel Shovel', 'CON-SHV-013', 'Construction', 320.00, 200.00, 30, 8, 'BuildPro Construction Materials', 'Tempered carbon steel pointed digging shovel with wood handle', '/IMG/CONS/Shovel.jpg'],
        ['P-074', 'Pointing Brick Trowel', 'CON-TRW-014', 'Construction', 150.00, 90.00, 50, 12, 'BuildPro Construction Materials', 'Forged high-carbon steel bricklaying pointing trowel, 6"', '/IMG/CONS/Trowel.jpg'],
        ['P-075', 'Safety Hard Hat Yellow', 'CON-HLM-015', 'Construction', 250.00, 150.00, 8, 10, 'BuildPro Construction Materials', 'Yellow ABS safety helmet for industrial site protection', '/IMG/CONS/Safety Helmet.jpg'], // Trigger Low Stock (8 <= 10)
        ['P-076', 'Tile Adhesive (25kg)', 'CON-ADH-016', 'Construction', 380.00, 290.00, 180, 40, 'BuildPro Construction Materials', 'Heavy-duty polymer modified concrete tile adhesive mortar', '/IMG/CONS/Tile Adhesive.jpg'],
        ['P-077', 'Masonry Club Hammer', 'CON-HAM-017', 'Construction', 350.00, 220.00, 22, 5, 'BuildPro Construction Materials', 'Short-handled high steel double-faced sledge sledgehammer', '/IMG/CONS/Masonry Hammer.jpg'],
        ['P-078', 'Rebar Tie Wire #16 (Roll)', 'CON-TIE-018', 'Construction', 120.00, 80.00, 140, 25, 'BuildPro Construction Materials', 'Black annealed steel tie wire gauge 16 for reinforcing', '/IMG/CONS/Rebar Tie Wire.jpg'],
        ['P-079', 'Chalk Line Reel Set', 'CON-CHK-019', 'Construction', 110.00, 70.00, 45, 10, 'BuildPro Construction Materials', 'Self-sealing plastic chalk line reel marking kit', '/IMG/CONS/Chalk Line.jpg'],
        ['P-080', 'Concrete Nails 3" (Box)', 'CON-NAL-020', 'Construction', 95.00, 60.00, 210, 50, 'BuildPro Construction Materials', 'Box of 1kg hardened steel grooved concrete nails', '/IMG/CONS/Concrete Nail.jpg'],

        // Category 5: Fasteners (SecureFast Industrial Fasteners)
        ['P-081', 'Wood Screws #8x1"', 'FAS-WDS-001', 'Fasteners', 120.00, 70.00, 400, 50, 'SecureFast Industrial Fasteners', 'Box of 100 pieces flat head countersunk wood screws', '/IMG/FAS/Wood Screw.jpg'],
        ['P-082', 'Concrete Screw Anchor', 'FAS-CNS-002', 'Fasteners', 150.00, 90.00, 240, 40, 'SecureFast Industrial Fasteners', 'Box of 100 blue hex head concrete masonry screws', '/IMG/FAS/Concrete Screw.jpg'],
        ['P-083', 'Drywall Screws 1-1/4"', 'FAS-DWS-003', 'Fasteners', 110.00, 65.00, 600, 100, 'SecureFast Industrial Fasteners', 'Box of 200 black phosphate bugle head drywall screws', '/IMG/FAS/Drywall Screw.jpg'],
        ['P-084', 'Hex Bolt M10 x 50mm', 'FAS-HEX-004', 'Fasteners', 8.00, 4.00, 1200, 200, 'SecureFast Industrial Fasteners', 'High tensile grade 8.8 zinc plated steel hex head bolt', '/IMG/FAS/Hex Bolt.jpg'],
        ['P-085', 'Hex Nut M10 Standard', 'FAS-NUT-005', 'Fasteners', 4.00, 2.00, 2000, 300, 'SecureFast Industrial Fasteners', 'Standard matching M10 hex nut zinc plated steel', '/IMG/FAS/Nut.jpg'],
        ['P-086', 'Flat Washer M10', 'FAS-WSH-006', 'Fasteners', 3.00, 1.50, 3000, 300, 'SecureFast Industrial Fasteners', 'M10 flat metal washers for load distribution, pack of 100', '/IMG/FAS/Flat Washer.jpg'],
        ['P-087', 'Spring Lock Washer M10', 'FAS-LKW-007', 'Fasteners', 4.00, 2.00, 1500, 200, 'SecureFast Industrial Fasteners', 'Split ring spring locking washer to prevent loosening', '/IMG/FAS/Lock Washer.jpg'],
        ['P-088', 'Blind Rivet 3/16" (Box)', 'FAS-RIV-008', 'Fasteners', 5.00, 2.50, 800, 100, 'SecureFast Industrial Fasteners', 'Aluminum pop blind dome head rivet fasteners, unit price', '/IMG/FAS/Rivet.jpg'],
        ['P-089', 'Sleeve Anchor Bolt 1/2"', 'FAS-ANC-009', 'Fasteners', 45.00, 25.00, 45, 50, 'SecureFast Industrial Fasteners', 'Heavy duty sleeve anchor bolt for solid brick wall', '/IMG/FAS/Anchor Bolt.jpg'], // Trigger Low Stock (45 <= 50)
        ['P-090', 'Concrete Expansion Bolt', 'FAS-EXP-010', 'Fasteners', 55.00, 32.00, 500, 100, 'SecureFast Industrial Fasteners', 'Stainless steel wedge masonry expansion bolt anchor', '/IMG/FAS/Expansion Bolt.jpg'],
        ['P-091', 'Galvanized U-Bolt M8', 'FAS-UBT-011', 'Fasteners', 35.00, 20.00, 120, 30, 'SecureFast Industrial Fasteners', 'Zinc-plated U-bolt clamp fastener with nuts and straps', '/IMG/FAS/U-Bolt.jpg'],
        ['P-092', 'Self-Tapping Screw #10', 'FAS-SLF-012', 'Fasteners', 130.00, 80.00, 350, 50, 'SecureFast Industrial Fasteners', 'Pan head sheet metal self-tapping screws, box of 100', '/IMG/FAS/Self-Tapping Screw.jpg'],
        ['P-093', 'Umbrella Roofing Nails', 'FAS-RFN-013', 'Fasteners', 95.00, 60.00, 180, 40, 'SecureFast Industrial Fasteners', 'Roofing nails with umbrella heads, sold per 1kg pack', '/IMG/FAS/Roofing Nail.jpg'],
        ['P-094', 'Finishing Nails 1-1/2"', 'FAS-FNN-014', 'Fasteners', 85.00, 50.00, 220, 40, 'SecureFast Industrial Fasteners', 'Bright wire finish nails for carpentry, 1kg box', '/IMG/FAS/Finishing Nail.jpg'],
        ['P-095', 'Pneumatic Brad Nails', 'FAS-BRD-015', 'Fasteners', 75.00, 45.00, 9, 30, 'SecureFast Industrial Fasteners', 'F30 air nailer gun brad nails, box of 5000', '/IMG/FAS/Brad Nail.jpg'], // Trigger Low Stock (9 <= 30)
        ['P-096', 'Steel Cotter Pin Set', 'FAS-CTP-016', 'Fasteners', 6.00, 3.00, 700, 100, 'SecureFast Industrial Fasteners', 'Split cotter pins for clevis pin locking mechanism', '/IMG/FAS/Cotter Pin.jpg'],
        ['P-097', 'Threaded Rod 1m M12', 'FAS-TRD-017', 'Fasteners', 180.00, 110.00, 60, 15, 'SecureFast Industrial Fasteners', 'All-thread rod zinc coated carbon steel, 1 meter length', '/IMG/FAS/Threaded Rod.jpg'],
        ['P-098', 'Heavy Duty Eye Bolt M12', 'FAS-EYE-018', 'Fasteners', 28.00, 15.00, 80, 20, 'SecureFast Industrial Fasteners', 'Forged lifting eye bolt ring loop thread screw bolt', '/IMG/FAS/Eye Bolt.jpg'],
        ['P-099', 'Spring Toggle Wing Bolt', 'FAS-TGL-019', 'Fasteners', 35.00, 20.00, 340, 50, 'SecureFast Industrial Fasteners', 'Spring wing toggle bolt anchor for drywall cavities', '/IMG/FAS/Toggle Bolt.jpg'],
        ['P-100', 'Pan Head Machine Screws', 'FAS-MAC-020', 'Fasteners', 90.00, 50.00, 250, 50, 'SecureFast Industrial Fasteners', 'Pan head philips drive machine screws, box of 100', '/IMG/FAS/Machine Screw.jpg'],

        // Category 6: Painting (ColorTech Paints & Coatings)
        ['P-101', 'Non-Drip Paint Roller 9"', 'PNT-RLR-001', 'Painting', 180.00, 110.00, 85, 20, 'ColorTech Paints & Coatings', '9-inch non-drip microfiber wall paint roller brush', '/IMG/PNT/Paint Roller.jpg'],
        ['P-102', 'Nylon Paint Brush 2"', 'PNT-BRS-002', 'Painting', 85.00, 50.00, 140, 30, 'ColorTech Paints & Coatings', 'Soft nylon bristles paint brush with ergonomic wood handle', '/IMG/PNT/Paint Brush.jpg'],
        ['P-103', 'Latex Paint White (4L)', 'PNT-LTX-003', 'Painting', 680.00, 510.00, 110, 20, 'ColorTech Paints & Coatings', 'Interior flat white latex acrylic wall paint, 4L gallon', '/IMG/PNT/Latex Paint.jpg'],
        ['P-104', 'Quick Dry Enamel Paint', 'PNT-ENM-004', 'Painting', 750.00, 560.00, 45, 12, 'ColorTech Paints & Coatings', 'Gloss white quick-drying oil-based enamel paint, 4L', '/IMG/PNT/Enamel Paint.jpg'],
        ['P-105', 'Plastic Paint Tray', 'PNT-TRY-005', 'Painting', 75.00, 45.00, 95, 15, 'ColorTech Paints & Coatings', 'Heavy plastic painting roller tray with textured ramp', '/IMG/PNT/Paint Tray.jpg'],
        ['P-106', 'Lacquer Thinner 1L', 'PNT-THN-006', 'Painting', 180.00, 110.00, 8, 15, 'ColorTech Paints & Coatings', 'Premium strength lacquer thinner and cleaner solvent, 1L', '/IMG/PNT/Lacquer Thinner.jpg'], // Trigger Low Stock (8 <= 15)
        ['P-107', 'Carbon Steel Putty Knife', 'PNT-KNF-007', 'Painting', 95.00, 55.00, 60, 10, 'ColorTech Paints & Coatings', 'Flexible carbon steel spackling scraper putty scraper, 3"', '/IMG/PNT/Putty Knife.jpg'],
        ['P-108', 'Drywall Sandpaper Grit-120', 'PNT-SND-008', 'Painting', 15.00, 8.00, 1000, 100, 'ColorTech Paints & Coatings', 'Silicon carbide dry sanding sandpaper sheets, 120-grit', '/IMG/PNT/Sandpaper.jpg'],
        ['P-109', 'Acry-Color Primer 4L', 'PNT-PRM-009', 'Painting', 620.00, 460.00, 35, 10, 'ColorTech Paints & Coatings', 'Water-based primer undercoat sealer for masonry, 4L', '/IMG/PNT/Primer Paint.jpg'],
        ['P-110', 'Aerosol Spray Paint Black', 'PNT-SPR-010', 'Painting', 160.00, 95.00, 180, 30, 'ColorTech Paints & Coatings', 'Acrylic general purpose gloss black aerosol spray, 400ml', '/IMG/PNT/Spray Paint.jpg'],
        ['P-111', 'Painter Masking Tape 1"', 'PNT-TPE-011', 'Painting', 80.00, 45.00, 220, 40, 'ColorTech Paints & Coatings', 'Crepe paper easy-release painter masking tape, 1-inch', '/IMG/PNT/Painter’s Tape.jpg'],
        ['P-112', 'Heavy Duty Paint Scraper', 'PNT-SCP-012', 'Painting', 120.00, 75.00, 48, 12, 'ColorTech Paints & Coatings', 'Rigid steel blade heavy duty paint scraper wood tool', '/IMG/PNT/Paint Scraper.jpg'],
        ['P-113', 'Disposable Drop Cloth', 'PNT-DRP-013', 'Painting', 350.00, 220.00, 65, 15, 'ColorTech Paints & Coatings', 'Transparent PE protective plastic dust sheet, 9x12ft', '/IMG/PNT/Drop Cloth.jpg'],
        ['P-114', 'Interior Wall Putty 5kg', 'PNT-PTY-014', 'Painting', 280.00, 190.00, 80, 15, 'ColorTech Paints & Coatings', 'Ready-mixed acrylic patch wall putty crack filler paste', '/IMG/PNT/Wall Putty.jpg'],
        ['P-115', 'Manual Paint Stirrer Mixer', 'PNT-MIX-015', 'Painting', 450.00, 290.00, 3, 10, 'ColorTech Paints & Coatings', 'Heavy duty power drill attachment steel paint mixer paddle', '/IMG/PNT/Paint Mixer.jpg'], // Trigger Low Stock (3 <= 10)
        ['P-116', 'Foam Paint Roller 4"', 'PNT-FOM-016', 'Painting', 95.00, 55.00, 130, 20, 'ColorTech Paints & Coatings', 'Mini high-density foam roller brush for smooth surfaces', '/IMG/PNT/Foam Roller.jpg'],
        ['P-117', 'Plastic Paint Bucket 10L', 'PNT-BCK-017', 'Painting', 140.00, 85.00, 55, 12, 'ColorTech Paints & Coatings', 'Empty graduated plastic paint mixing pail with metal handle', '/IMG/PNT/Paint Bucket.jpg'],
        ['P-118', 'Wall Stain Remover Spray', 'PNT-REM-018', 'Painting', 240.00, 150.00, 28, 8, 'ColorTech Paints & Coatings', 'Mildew and grease surface stain remover cleaner spray', '/IMG/PNT/Stain Remover.jpg'],
        ['P-119', 'Clear Wood Varnish 1L', 'PNT-VRN-019', 'Painting', 380.00, 260.00, 42, 10, 'ColorTech Paints & Coatings', 'Clear gloss polyurethane wood varnish finish protective coat', '/IMG/PNT/Varnish.jpg'],
        ['P-120', 'Paint Thinner Solvent 1L', 'PNT-LAQ-020', 'Painting', 195.00, 120.00, 1, 15, 'ColorTech Paints & Coatings', 'Pure paint thinner solvent for cleaning brushes, 1L', '/IMG/PNT/Paint Thinner.jpg'] // Trigger Low Stock (1 <= 15)
    ];

    $prodSql = "INSERT INTO products 
        (id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $prodStmt = $pdo->prepare($prodSql);
    foreach ($products as $prod) {
        $prodStmt->execute($prod);
    }

    // 4. Seed Historical Sales Spanning 30 Days (using the new 120 products)
    $cashiers = ['Sarah Cruz', 'Mark Santos', 'Dave Reyes', 'Jenny Lim'];
    $paymentMethods = ['cash', 'card', 'online', 'check'];
    $customers = ['Juan dela Cruz', 'Maria Clara', 'Crisostomo Ibarra', 'Simoun', 'Leonor Rivera', 'Walk-in', 'Walk-in', 'Walk-in', 'Walk-in'];

    $now = new DateTime();
    $saleIdCounter = 1;

    for ($day = 30; $day >= 0; $day--) {
        $date = clone $now;
        $date->modify("-$day days");
        $dayOfWeek = $date->format('N'); // 1 (Mon) - 7 (Sun)
        
        // Weekend has more transactions
        $numSales = rand(3, 5);
        if ($dayOfWeek >= 5) {
            $numSales = rand(6, 10);
        }

        for ($s = 0; $s < $numSales; $s++) {
            $saleId = 'SALE-' . (1716000000 + ($day * 20000) + ($s * 100) + rand(0, 99));
            $cashier = $cashiers[array_rand($cashiers)];
            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
            $customer = $customers[array_rand($customers)];
            
            $hour = rand(8, 20); // Store hours: 8am - 8pm
            $minute = rand(0, 59);
            $second = rand(0, 59);
            $saleDate = clone $date;
            $saleDate->setTime($hour, $minute, $second);
            $createdAtStr = $saleDate->format('Y-m-d H:i:s');

            // Pick 1 to 4 random products
            $numItems = rand(1, 4);
            $chosenKeys = (array) array_rand($products, $numItems);
            
            $saleItems = [];
            $saleTotal = 0;

            foreach ($chosenKeys as $idx) {
                $prod = $products[$idx];
                
                // Fasteners/Construction are bought in larger quantities
                $qty = rand(1, 2);
                if ($prod[3] === 'Fasteners') {
                    $qty = rand(5, 20);
                } else if ($prod[3] === 'Construction') {
                    $qty = rand(2, 5);
                }

                $price = $prod[4];
                $itemTotal = $price * $qty;
                $saleTotal += $itemTotal;

                $saleItems[] = [
                    'product_id' => $prod[0],
                    'product_name' => $prod[1],
                    'quantity' => $qty,
                    'price' => $price,
                    'total' => $itemTotal
                ];
            }

            // 15% chance of discount
            $discount = 0;
            if (rand(1, 100) > 85) {
                $discount = round($saleTotal * (rand(5, 15) / 100), 2);
            }

            $netTotal = $saleTotal - $discount;
            $tax = round($netTotal * 0.12, 2); // 12% VAT
            $amountPaid = $netTotal;
            if ($paymentMethod === 'cash') {
                $amountPaid = ceil($netTotal / 50) * 50; // pay in multiples of 50
            }
            $changeAmount = round($amountPaid - $netTotal, 2);

            // Insert into sales
            $sql = "INSERT INTO sales (id, customer_name, total, tax, discount, payment_method, amount_paid, change_amount, status, cashier, notes, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $saleId,
                $customer,
                $netTotal,
                $tax,
                $discount,
                $paymentMethod,
                $amountPaid,
                $changeAmount,
                $cashier,
                $customer !== 'Walk-in' ? "Customer: $customer" : "",
                $createdAtStr
            ]);

            // Insert into sale_items
            foreach ($saleItems as $item) {
                $itemSql = "INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, unit_price, discount, total) 
                            VALUES (?, ?, ?, ?, ?, ?, 0, ?)";
                $itemStmt = $pdo->prepare($itemSql);
                $itemStmt->execute([
                    $saleId,
                    $item['product_id'],
                    $item['product_name'],
                    $item['quantity'],
                    $item['price'],
                    $item['price'],
                    $item['total']
                ]);
            }
        }
    }

    // 5. Generate Inventory Alerts dynamically
    foreach ($products as $prod) {
        $quantity = $prod[6];
        $reorderLevel = $prod[7];
        if ($quantity <= $reorderLevel) {
            $alertId = 'ALT-' . bin2hex(random_bytes(4));
            $alertMsg = "Low stock alert: " . $prod[1] . " has only " . $quantity . " units left.";
            $alertStmt = $pdo->prepare("INSERT INTO alerts (id, product_id, type, message) VALUES (?, ?, 'low-stock', ?)");
            $alertStmt->execute([$alertId, $prod[0], $alertMsg]);
        }
    }

    $pdo->commit();
    echo json_encode([
        'success' => true, 
        'message' => 'Successfully populated the database with 120 products, 6 suppliers and sales history!',
        'counts' => [
            'suppliers' => count($suppliers),
            'products' => count($products),
            'alerts' => 8
        ]
    ]);

} catch (Exception $e) {
    try {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
    } catch (Exception $rollEx) {
    }
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
?>
