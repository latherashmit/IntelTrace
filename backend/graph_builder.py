# import networkx as nx

# def build_intel_graph(suspects_df, events_df, transactions_df):
#     G = nx.Graph()

#     # 1. Add suspect nodes and associate edges
#     for _, row in suspects_df.iterrows():
#         G.add_node(
#             row["suspect_id"],
#             label=row["name"],
#             type="suspect",
#             risk=row["risk_level"]
#         )

#         for associate_id in row["known_associates"]:
#             G.add_edge(
#                 row["suspect_id"],
#                 associate_id,
#                 relation="associate"
#             )

#     # 2. Add event nodes and "involved" edges
#     for _, row in events_df.iterrows():
#         G.add_node(
#             row["event_id"],
#             label=row["type"],
#             type="event"
#         )

#         for suspect_id in row["suspects_involved"]:
#             G.add_edge(
#                 suspect_id,
#                 row["event_id"],
#                 relation="involved"
#             )

#     # 3. Add transaction edges
#     for _, row in transactions_df.iterrows():
#         G.add_edge(
#             row["from_id"],
#             row["to_id"],
#             relation="transaction",
#             amount=row["amount"],
#             method=row["method"]
#         )

#     return G
