# import pandas as pd # Library for data analysis and manipulation (filtering, merging, cleaning)
# import ast  # For safely converting stringified Python literals (like lists) into actual Python objects
# import os # For file path handling

# def load_data():
#     # Go one level up and into "data"
#     base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))

#     suspects_path = os.path.join(base_dir, 'inteltrace_suspects.csv')
#     events_path = os.path.join(base_dir, 'inteltrace_events.csv')
#     transactions_path = os.path.join(base_dir, 'inteltrace_transactions.csv')

#     # Read CSVs and parse list-like columns
#     suspects = pd.read_csv(suspects_path, converters={"known_associates": ast.literal_eval})
#     events = pd.read_csv(events_path, converters={"suspects_involved": ast.literal_eval})
#     transactions = pd.read_csv(transactions_path)

#     # Optional: ensure 'time' is string (if not already)
#     if 'time' in events.columns:
#         events['time'] = events['time'].astype(str)
        
#     if 'time' in transactions.columns:
#         transactions['time'] = transactions['time'].astype(str)

#     return suspects, events, transactions

import pandas as pd
import ast
import os

def parse_coordinates(coord_str):
    try:
        lat_str, lon_str = coord_str.split(',')
        lat = float(lat_str.strip().replace('° N', '').replace('° S', '-'))
        lon = float(lon_str.strip().replace('° E', '').replace('° W', '-'))
        return pd.Series({'latitude': lat, 'longitude': lon})
    except Exception as e:
        print(f"Error parsing coordinates '{coord_str}': {e}")
        return pd.Series({'latitude': None, 'longitude': None})

def load_data():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))

    suspects_path = os.path.join(base_dir, 'inteltrace_suspects.csv')
    events_path = os.path.join(base_dir, 'inteltrace_events.csv')
    transactions_path = os.path.join(base_dir, 'inteltrace_transactions.csv')

    # No 'known_associates' now
    suspects = pd.read_csv(suspects_path)
    print(suspects.columns.tolist())
    events = pd.read_csv(events_path, converters={"suspects_involved": ast.literal_eval})
    transactions = pd.read_csv(transactions_path)

    # Parse coordinates into separate columns
    if 'last_seen_coordinates' in suspects.columns:
        coords = suspects['last_seen_coordinates'].apply(parse_coordinates)
        suspects = pd.concat([suspects, coords], axis=1)

    # Convert time columns to strings
    if 'time' in events.columns:
        events['time'] = events['time'].astype(str)
    if 'time' in transactions.columns:
        transactions['time'] = transactions['time'].astype(str)

    return suspects, events, transactions
