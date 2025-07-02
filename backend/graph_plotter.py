# import matplotlib.pyplot as plt
# import networkx as nx
# from load_data import load_data
# from graph_builder import build_intel_graph

# # Load data
# suspects, events, transactions = load_data()

# # Build graph
# G = build_intel_graph(suspects, events, transactions)

# # Layout
# pos = nx.spring_layout(G, seed=42)

# # Separate nodes by type
# suspects_nodes = [n for n, attr in G.nodes(data=True) if attr.get("type") == "suspect"]
# event_nodes = [n for n, attr in G.nodes(data=True) if attr.get("type") == "event"]

# # Draw suspects
# nx.draw_networkx_nodes(G, pos, nodelist=suspects_nodes, node_color='skyblue', node_size=600, label='Suspects')

# # Draw events
# nx.draw_networkx_nodes(G, pos, nodelist=event_nodes, node_color='orange', node_size=600, label='Events')

# # Draw edges
# nx.draw_networkx_edges(G, pos)

# # Add labels
# labels = {n: d['label'] for n, d in G.nodes(data=True)}
# nx.draw_networkx_labels(G, pos, labels, font_size=8)

# # Display
# plt.title("IntelTrace Relationship Graph")
# plt.axis('off')
# plt.legend()
# plt.show()
