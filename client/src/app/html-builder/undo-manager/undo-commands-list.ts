import commandParams from "./undo-manager-types";

type commandInterface = {undo: Function, redo: Function};

export class UndoCommandsList {

    public static generic(params: commandParams) {
        return {
            undo: params.undo,
            redo: params.redo,
        }
    }

    public static domChanges(params: commandParams) {
        return {
            undo: () => {
                //params.node.parentNode.replaceChild(params.oldNode, params.node);

                while (params.node.hasChildNodes()) params.node.removeChild(params.node.firstChild);

                const cloned = params.oldNode.cloneNode(true);
                while (cloned.hasChildNodes()) params.node.appendChild(cloned.firstChild);

                //params.node = params.oldNode;
            },
            redo: () => {
                //params.node.parentNode.replaceChild(params.newNode, params.node);

                while (params.node.hasChildNodes()) params.node.removeChild(params.node.firstChild);

                const cloned = params.newNode.cloneNode(true);
                while (cloned.hasChildNodes()) params.node.appendChild(cloned.firstChild);



                //params.node = params.newNode;
            },
        }
    }
}
