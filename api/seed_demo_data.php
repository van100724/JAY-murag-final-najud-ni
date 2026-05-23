<?php
require_once 'db.php';
handleCors();

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

    // 2. Seed Premium Suppliers
    $suppliers = [
        ['SUP-001', 'ABC Hardware Supplies', 'Jose Rizal', 'jose.rizal@abchardware.ph', '+63 917 123 4567', '123 Rizal Ave', 'Manila', 'NCR', '1000', 'Philippines', 'Net30', 'Hand Tools, Fasteners', 'active', 4.80, 3],
        ['SUP-002', 'BuildPro Materials', 'Andres Bonifacio', 'andres.b@buildpro.ph', '+63 918 234 5678', '456 Bonifacio St', 'Quezon City', 'NCR', '1100', 'Philippines', 'COD', 'Construction, Plumbing', 'active', 4.50, 5],
        ['SUP-003', 'PowerTools Depot', 'Juan Luna', 'juan.luna@powertools.ph', '+63 919 345 6789', '789 Luna Blvd', 'Cebu City', 'Cebu', '6000', 'Philippines', 'Net30', 'Power Tools, Garden', 'active', 4.90, 2],
        ['SUP-004', 'Lumina Tech', 'Emilio Aguinaldo', 'emilio.a@luminatech.ph', '+63 920 456 7890', '101 Aguinaldo Hwy', 'Cavite City', 'Cavite', '4100', 'Philippines', 'Net60', 'Electrical', 'active', 4.20, 4],
        ['SUP-005', 'ColorTech Supplies', 'Apolinario Mabini', 'apolinario.m@colortech.ph', '+63 921 567 8901', '202 Mabini St', 'Davao City', 'Davao del Sur', '8000', 'Philippines', 'Net30', 'Painting', 'active', 4.60, 3],
        ['SUP-006', 'SafeBuild Inc', 'Gabriela Silang', 'gabriela.s@safebuild.ph', '+63 922 678 9012', '303 Silang Way', 'Vigan City', 'Ilocos Sur', '2700', 'Philippines', 'Net30', 'Safety, Garden', 'active', 4.75, 2]
    ];

    $supSql = "INSERT INTO suppliers 
        (id, name, contact_person, email, phone, address, city, state, zip_code, country, payment_terms, category, status, rating, average_delivery_time) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $supStmt = $pdo->prepare($supSql);
    foreach ($suppliers as $sup) {
        $supStmt->execute($sup);
    }

    // 3. Seed High-Fidelity Products
    $products = [
        // id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image
        ['1', 'Industrial Claw Hammer 16oz', 'HTL-HAM-001', 'Hand Tools', 450.00, 280.00, 34, 10, 'ABC Hardware Supplies', '16oz forged steel claw hammer with anti-vibration grip', '/IMG/CONS/Masonry Hammer.jpg'],
        ['7', 'Precision Tape Measure 8m', 'HTL-TPE-007', 'Hand Tools', 280.00, 150.00, 45, 15, 'ABC Hardware Supplies', 'High-visibility 8-meter retractable steel tape measure', '/IMG/CONS/Measuring Tape.jpg'],
        ['25', 'Adjustable Wrench 12"', 'HTL-WRN-025', 'Hand Tools', 650.00, 420.00, 8, 10, 'ABC Hardware Supplies', 'Chrome vanadium steel adjustable wrench, 12-inch', '/IMG/PLU/Pipe Wrench.jpg'],
        
        ['4', 'Brushless Cordless Drill 18V', 'PWR-DRL-004', 'Power Tools', 4850.00, 3200.00, 12, 5, 'PowerTools Depot', 'High-torque 18V brushless drill with 2x 4.0Ah batteries', '/IMG/PWR/Cordless Drill.jpg'],
        ['19', 'Professional Angle Grinder 4"', 'PWR-GRN-019', 'Power Tools', 3200.00, 2100.00, 15, 5, 'PowerTools Depot', '900W professional angle grinder with safety guard', '/IMG/PWR/Angle Grinder.jpg'],
        ['26', 'Circular Saw 1500W', 'PWR-SAW-026', 'Power Tools', 5400.00, 3800.00, 3, 4, 'PowerTools Depot', 'Heavy duty circular saw with laser guide', '/IMG/PWR/Circular Saw.jpg'],

        ['5', 'Premium Portland Cement 40kg', 'CON-CMT-005', 'Construction', 285.00, 240.00, 450, 100, 'BuildPro Materials', 'Standard Type 1P Portland cement for general construction', '/IMG/CONS/Cement.jpg'],
        ['22', 'Steel Rebar 10mm x 6m', 'CON-RBR-022', 'Construction', 245.00, 190.00, 800, 200, 'BuildPro Materials', 'Grade 33 structural steel rebar, 10mm diameter', '/IMG/CONS/Steel Bar.jpg'],
        ['27', 'Hollow Block 4" Standard', 'CON-BLK-027', 'Construction', 15.00, 11.00, 2500, 500, 'BuildPro Materials', 'Load-bearing concrete hollow block, 4-inch width', '/IMG/CONS/Hollow Blocks.jpg'],

        ['2', 'PVC Pipe 2" (Schedule 40)', 'PLU-PVC-002', 'Plumbing', 480.00, 350.00, 120, 30, 'BuildPro Materials', 'Blue PVC pipe for water main lines, 10ft length', '/IMG/PLU/PVC Pipe.jpg'],
        ['21', 'Modern Kitchen Faucet', 'PLU-FCT-021', 'Plumbing', 2450.00, 1600.00, 14, 5, 'BuildPro Materials', 'Brushed nickel single-handle pull-down kitchen faucet', '/IMG/PLU/Faucet.jpg'],
        ['28', 'Teflon Tape 1/2"', 'PLU-TFE-028', 'Plumbing', 25.00, 12.00, 300, 50, 'BuildPro Materials', 'Thread seal tape for plumbing joints', '/IMG/PLU/Teflon Tape.jpg'],

        ['6', 'LED Bulb 12W (Daylight)', 'ELE-LGT-006', 'Electrical', 185.00, 110.00, 240, 50, 'Lumina Tech', 'Energy-saving 12W LED bulb, 6500K cool daylight', '/IMG/ELE/LED Bulb.jpg'],
        ['15', 'Heavy Duty Extension 10m', 'ELE-EXT-015', 'Electrical', 850.00, 520.00, 28, 10, 'Lumina Tech', '10-meter extension cord with 3-way outlet and surge protection', '/IMG/ELE/Extension Cord.jpg'],
        ['29', 'THHN Wire 2.0mm (150m)', 'ELE-WRE-029', 'Electrical', 3400.00, 2800.00, 15, 5, 'Lumina Tech', 'Stranded copper electrical wire, 150-meter roll', '/IMG/ELE/Electrical Wire.jpg'],

        ['3', 'Professional Roller Set', 'PNT-RLR-003', 'Painting', 320.00, 180.00, 42, 12, 'ColorTech Supplies', '9-inch non-drip paint roller with metal tray', 'https://images.unsplash.com/photo-1589939705384-5185138a04b9?w=600&h=600&fit=crop'],
        ['8', 'Latex Paint White (4L)', 'PNT-WHT-008', 'Painting', 680.00, 510.00, 35, 10, 'ColorTech Supplies', 'Premium flat white latex paint, 4-liter gallon', 'https://images.unsplash.com/photo-1562591176-3293399991cb?w=600&h=600&fit=crop'],
        ['20', 'Paint Thinner 1L', 'PNT-THN-020', 'Painting', 180.00, 110.00, 3, 15, 'ColorTech Supplies', 'Grade A premium paint thinner for oil-based paints', 'https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=600&h=600&fit=crop'],

        ['9', 'Industrial Safety Helmet', 'SAF-HLM-009', 'Safety', 350.00, 210.00, 48, 15, 'SafeBuild Inc', 'Reinforced yellow hard hat with adjustable suspension', '/IMG/CONS/Safety Helmet.jpg'],
        ['12', 'Auto-Darkening Welding Mask', 'SAF-WLD-012', 'Safety', 2850.00, 1950.00, 2, 3, 'SafeBuild Inc', 'Solar-powered auto-darkening welding helmet, DIN 9-13', 'https://images.unsplash.com/photo-1530124560676-41bc1275d4d4?w=600&h=600&fit=crop'],
        ['30', 'N95 Respirator Mask (Box)', 'SAF-MSK-030', 'Safety', 850.00, 450.00, 40, 10, 'SafeBuild Inc', 'Box of 20 industrial-grade N95 dust masks', 'https://images.unsplash.com/photo-1584622781564-1d9876a13301?w=600&h=600&fit=crop'],

        ['11', 'Wood Screw #8 x 1" (Box)', 'FAS-SCR-011', 'Fasteners', 180.00, 95.00, 150, 25, 'ABC Hardware Supplies', 'Box of 100 zinc-plated wood screws', '/IMG/FAS/Wood Screw.jpg'],
        ['14', 'Common Nail 3" (kg)', 'FAS-NAL-014', 'Fasteners', 95.00, 65.00, 300, 50, 'ABC Hardware Supplies', 'Polished steel common nails, sold per kilogram', '/IMG/FAS/Brad Nail.jpg'],
        ['31', 'Expansion Bolt 3/8"', 'FAS-BLT-031', 'Fasteners', 45.00, 28.00, 500, 100, 'ABC Hardware Supplies', 'Heavy duty steel expansion sleeve bolt for concrete', '/IMG/FAS/Expansion Bolt.jpg'],

        ['18', 'Garden Hose 30m Heavy', 'GAR-HSE-018', 'Garden', 1250.00, 850.00, 22, 5, 'SafeBuild Inc', 'Anti-kink reinforced garden hose, 30-meter length', '/IMG/PLU/Water Hose.jpg'],
        ['17', 'Industrial Wheelbarrow', 'GAR-WHL-017', 'Garden', 3800.00, 2900.00, 8, 3, 'PowerTools Depot', 'Deep-dish steel wheelbarrow with pneumatic tire', '/IMG/CONS/Wheelbarrow.jpg']
    ];

    $prodSql = "INSERT INTO products 
        (id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $prodStmt = $pdo->prepare($prodSql);
    foreach ($products as $prod) {
        $prodStmt->execute($prod);
    }

    // 4. Seed 120+ Historical Sales spanning 30 Days
    $cashiers = ['Sarah Cruz', 'Mark Santos', 'Dave Reyes', 'Jenny Lim'];
    $paymentMethods = ['cash', 'card', 'online', 'check'];
    $customers = ['Juan dela Cruz', 'Maria Clara', 'Crisostomo Ibarra', 'Simoun', 'Leonor Rivera', 'Walk-in', 'Walk-in', 'Walk-in', 'Walk-in'];

    $now = new DateTime();
    $saleIdCounter = 1;

    // Loop through past 30 days
    for ($day = 30; $day >= 0; $day--) {
        $date = clone $now;
        $date->modify("-$day days");
        $dayOfWeek = $date->format('N'); // 1 (Mon) - 7 (Sun)
        
        // Weekend has more transactions
        $numSales = rand(3, 5);
        if ($dayOfWeek >= 5) { // Fri, Sat, Sun
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

            // Payment cash rounded
            $amountPaid = $netTotal;
            if ($paymentMethod === 'cash') {
                $amountPaid = ceil($netTotal / 50) * 50; // pay in multiples of 50
            }
            $changeAmount = round($amountPaid - $netTotal, 2);

            // Insert into sales table
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

            // Insert into sale_items table
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
        'message' => 'Presentation mock data successfully seeded in MariaDB!',
        'counts' => [
            'suppliers' => count($suppliers),
            'products' => count($products),
            'alerts' => 3 // we set painting/safety low stock to trigger
        ]
    ]);

} catch (Exception $e) {
    $origError = $e->getMessage();
    try {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
    } catch (Exception $rollEx) {
        // Ignore rollback failure to preserve original error
    }
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $origError
    ]);
}
?>
