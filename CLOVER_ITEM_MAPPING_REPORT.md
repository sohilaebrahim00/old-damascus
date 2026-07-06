# CLOVER_ITEM_MAPPING_REPORT — Live Production Catalog

This report documents the exact mapping of local website menu items to the verified live Clover production inventory for merchant **NEW OLD DAMASCUS** (ID: `4HHSMAKE7E941`).

## 1. Primary Website Items Mapped to Clover

| Website Item | Clover Item Name | Clover Item ID | Website Price | Clover Price | Category (ID) | Availability | Tax Treatment | Modifier Groups | Hidden/Deleted |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chicken Shawarma Wrap** | `Chicken Shawarma Sandwich` | `71T948RMM7VC8` | $12.99 | **$9.99** | Sandwiches (`5YSQRG9ZXGSDT`) | Available (`enabledOnline: true`) | Sales Tax 8.25% (`HQ4TNC6YMWD84`) | None | No |
| **Falafel Sandwich** | `Falafel Sandwich` | `X7J8DGH1S2SWT` | $9.99 | **$8.99** | Sandwiches (`5YSQRG9ZXGSDT`) | Available (`enabledOnline: true`) | Sales Tax 8.25% (`HQ4TNC6YMWD84`) | None | No |
| **Chicken Nuggets (6) Pcs** | `Nuggets Chicken 6PC` | `E5QRFFKK6B0WP` | $10.99 | **$8.99** | Kids Menu (`HQFGDVPHAS4VE`) | Available (`enabledOnline: false`)* | Sales Tax 8.25% (`HQ4TNC6YMWD84`) | None | No |

*\*Note: Nuggets Chicken 6PC is available in inventory and has stock but is flagged `enabledOnline: false` for direct Clover Online ordering inside the POS. Since website checkout validates against direct mapping, the checkout system handles this state.*

## 2. Additional Catalog Matches

The following matches from our menu seed have also been resolved against the production inventory:

| Website Item | Clover Item Name | Clover Item ID | Website Price | Clover Price | Category | Availability | Price Difference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chicken Tenders (3) Pcs** | `Tender Chicken 3PC` | `8JTN1BY4469JG` | $10.99 | $8.99 | Kids Menu | Available | -$2.00 |
| **Adana Kebab Sandwich** | `Adana Kabob Sandwich` | `6B6EXEM4TA9SA` | $12.99 | $9.99 | Sandwiches | Available | -$3.00 |
| **Shish Tawook Wrap** | `Shish Tawook Sandwich` | `T9DVYZY8V7396` | $12.99 | $9.99 | Sandwiches | Available | -$3.00 |
| **Beef kabab Sandwich** | `kofta Kabab Sandwich` | `YGPAR9058VGW2` | $12.99 | $9.99 | Sandwiches | Available | -$3.00 |
| **Shish Tawook Plate** | `Shish Tawook Plate` | `5FEYTBHA6FGG0` | $23.99 | $17.99 | Grilled Dishes | Available | -$6.00 |
| **Mix Grill** | `Mix Grill` | `0C7K8NJRBFWEG` | $31.99 | $24.99 | Grilled Dishes | Available | -$7.00 |
| **Lamb Over Rice (Mandi)** | `Mandi Lamb` | `B5X1QYNWN8TET` | $26.99 | $21.99 | Main Dishes | Available | -$5.00 |
| **Hummus** | `Hummus` | `2YSHB4BK61HS4` | $9.99 | $7.99 | Appetizers | Available | -$2.00 |
| **Grape Leaves – 8 Pieces** | `Grape Leaves 8 Pcs` | `TM0960W8EXSN0` | $12.99 | $8.99 | Appetizers | Available | -$4.00 |
| **Fried Kubbeh – 3 Pieces** | `Kubbeh 3pcs` | `EVM9VTTJY41V0` | $12.99 | $7.99 | Appetizers | Available | -$5.00 |
| **Cheese Rolls** | `Cheese Rolls 4pcs` | `SQBFAG44N1S9T` | $12.99 | $7.99 | Appetizers | Available | -$5.00 |
| **Fattoush Salad** | `Fattoush` | `J1XW0A7FJH986` | $12.99 | $8.99 | Salads | Available | -$4.00 |
| **Chocolate Cake** | `Chocolate Cake` | `8BB6TRA2TJK5G` | $6.99 | $4.99 | Desserts | Available | -$2.00 |
| **Baklawa – 4 Pieces** | `Baklawa 4pcs` | `EFH03853M9B00` | $7.99 | $6.99 | Desserts | Available | -$1.00 |
| **Turkish Coffee** | `Turkish Coffee` | `6BWA26G7QYR3T` | $4.99 | $3.99 | Drinks | Available | -$1.00 |

## 3. Discovered Order Types

These order types must be configured in `.env.local` to process orders correctly:

- **Online Order Pick Up**: `6F4R7QDTMDM3R`
- **Online Order Delivery**: `BSJ107MZC4GMG`

## 4. Discovered Taxes

- **Sales Tax**: `Sales Tax ` (ID: `HQ4TNC6YMWD84`) -> **8.25%** (Default: YES)
- **No Tax**: `NO_TAX_APPLIED` (ID: `KPFE220EQX3NC`) -> **0%** (Default: NO)
