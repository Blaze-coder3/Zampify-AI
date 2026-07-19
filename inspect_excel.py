import pandas as pd
import json

files = [
    r"c:\Users\A Syed Khwaja\Downloads\Zampify_Dataset\vendors_v2.xlsx",
    r"c:\Users\A Syed Khwaja\Downloads\Zampify_Dataset\products.xlsx",
    r"c:\Users\A Syed Khwaja\Downloads\Zampify_Dataset\purchase_orders.xlsx",
    r"c:\Users\A Syed Khwaja\Downloads\Zampify_Dataset\po_line_items.xlsx",
    r"c:\Users\A Syed Khwaja\Downloads\Zampify_Dataset\goods_receipts.xlsx"
]

output = {}

for f in files:
    try:
        df = pd.read_excel(f)
        output[f] = {
            "columns": list(df.columns),
            "sample": df.head(3).to_dict(orient="records")
        }
    except Exception as e:
        output[f] = {"error": str(e)}

print(json.dumps(output, indent=2, default=str))
