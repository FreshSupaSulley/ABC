import yaml
import io
from openpyxl import Workbook

def generate_bom_from_yaml(yaml_text: str, inputs: dict) -> list[dict]:
    print(inputs)
    try:
        schema = yaml.safe_load(yaml_text)
    except yaml.YAMLError as e:
        raise ValueError(f"Invalid YAML: {e}")

    if not isinstance(schema, dict):
        raise ValueError("YAML root must be a dictionary")

    questions = schema.get("questions", [])
    rules = schema.get("rules", [])

    if not isinstance(questions, list) or not isinstance(rules, list):
        raise ValueError("'questions' and 'rules' must be lists")

    context = dict(inputs)
    bom = []
    for rule in rules:
        cond = rule.get("condition")
        add = rule.get("add")
        
        if not cond or not add:
            raise ValueError("Each rule must have 'condition' and 'add'")

        try:
            if eval(cond, {}, context):
                product = add.get("product")
                quantity = add.get("quantity")
                if isinstance(quantity, str):
                    quantity = eval(quantity, {}, context)
                bom.append({"product": product, "quantity": quantity})
        except Exception as e:
            raise ValueError(f"Error evaluating rule: {e}")

    return bom

def export_bom_to_excel(bom: list[dict]) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Bill of Materials"

    ws.append(["Product", "Quantity"])
    for item in bom:
        ws.append([item["product"], item["quantity"]])

    file = io.BytesIO()
    wb.save(file)
    return file.getvalue()
