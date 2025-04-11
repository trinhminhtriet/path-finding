import AStar from "./algorithms/AStar";
import BidirectionalSearch from "./algorithms/BidirectionalSearch";
import Dijkstra from "./algorithms/Dijkstra";
import Greedy from "./algorithms/Greedy";
import PathFindingAlgorithm from "./algorithms/PathFindingAlgorithm";

export default class PathFindingState {
    static #instance;

    /**
     * Singleton class
     * @returns {PathFindingState}
     */
    constructor() {
        if (!PathFindingState.#instance) {
            this.endNode = null;
            this.graph = null;
            this.finished = false;
            this.algorithm = new PathFindingAlgorithm();
            PathFindingState.#instance = this;
        }

        return PathFindingState.#instance;
    }

    get startNode() {
        return this.graph.startNode;
    }

    /**
     *
     * @param {Number} id OSM node id
     * @returns {import("./Node").default} node
     */
    getNode(id) {
        return this.graph?.getNode(id);
    }

    /**
     * Resets to default state
     */
    reset() {
        this.finished = false;
        if(!this.graph) return;
        for(const key of this.graph.nodes.keys()) {
            this.graph.nodes.get(key).reset();
        }
    }

    /**
     * Resets state and initializes new pathfinding animation
     */
    start(algorithm) {
        this.reset();
        switch(algorithm) {
            case "astar":
                this.algorithm = new AStar();
                break;
            case "greedy":
                this.algorithm = new Greedy();
                break;
            case "dijkstra":
                this.algorithm = new Dijkstra();
                break;
            case "bidirectional":
                this.algorithm = new BidirectionalSearch();
                break;
            default:
                this.algorithm = new AStar();
                break;
        }

        this.algorithm.start(this.startNode, this.endNode);
    }

    /**
     * Progresses the pathfinding algorithm by one step/iteration
     * @returns {(import("./Node").default)[]} array of nodes that were updated
     */
    nextStep() {
        const updatedNodes = this.algorithm.nextStep();
        if(this.algorithm.finished || updatedNodes.length === 0) {
            this.finished = true;
        }

        return updatedNodes;
    }
}
