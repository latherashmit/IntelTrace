# import matplotlib.pyplot as plt
# import networkx as nx

# # Step 1: Initialize Graph
# G = nx.Graph()

# # Step 2: Add Nodes
# people = ["Zahid Latif", "Imran Qureshi", "Aamir Sheikh", "Rahul Mehta"]
# G.add_nodes_from(people)

# # Step 3: Add Edges (Relationships)
# relations = [
#     ("Zahid Latif", "Imran Qureshi"),
#     ("Zahid Latif", "Rahul Mehta"),
#     ("Aamir Sheikh", "Imran Qureshi"),
#     ("Aamir Sheikh", "Rahul Mehta"),
# ]
# G.add_edges_from(relations)

# # Step 4: Define Colors
# color_map = []
# for node in G:
#     if node == "Zahid Latif":
#         color_map.append('red')  # Suspicious node
#     else:
#         color_map.append('skyblue')  # Others

# # Step 5: Draw the Graph
# pos = nx.circular_layout(G)
# plt.figure(figsize=(8, 6))
# nx.draw(
#     G, pos,
#     with_labels=True,
#     node_color=color_map,
#     node_size=2000,
#     font_size=10,
#     edge_color='black',
#     font_weight='bold'
# )

# plt.title("IntelTrace: Relationship Graph Demo", fontsize=14)
# plt.axis('off')
# plt.show()
