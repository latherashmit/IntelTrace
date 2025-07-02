
import pandas as pd
import ast
import os

def load_data():
    # Go one level up and into "data"
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))

    suspects_path = os.path.join(base_dir, 'inteltrace_suspects.csv')
    events_path = os.path.join(base_dir, 'inteltrace_events.csv')
    transactions_path = os.path.join(base_dir, 'inteltrace_transactions.csv')

    # Read CSVs and parse list-like columns
    suspects = pd.read_csv(suspects_path, converters={"known_associates": ast.literal_eval})
    events = pd.read_csv(events_path, converters={"suspects_involved": ast.literal_eval})
    transactions = pd.read_csv(transactions_path)

    # Optional: ensure 'time' is string (if not already)
    if 'time' in events.columns:
        events['time'] = events['time'].astype(str)

    return suspects, events, transactions
