export const makeAbb = (x) => {
    if (x == null) return ''
    const abbr = (str) =>
        str
            .match(/\b([A-Za-z0-9])/g)
            .join("")
            .toUpperCase();
    const abbreviation = abbr(x);
    const output =
        abbreviation.substring(0, 1) +
        x[1].toUpperCase() +
        "-" +
        abbreviation.substring(1) +
        "E";    
    return output;
};


export const filterColoumns = (headers,data,colHeading,val) => {
    let newData = [];
    let arrpos = headers.findIndex((x) => x === colHeading);
    for (let idx in data) {
        if (
            String(data[idx][arrpos])
                .toLowerCase()
                .includes(String(val).toLowerCase().trim())
        ) {
            newData.push(data[idx]);
        }
    }
    
    return newData;
}

export const prepData = (headers,data,colHeading,val) => {
    let newData = [];
    let arrpos = headers.findIndex((x) => x === colHeading);
    for (let idx in data) {
        if (
            String(data[idx][arrpos])
                .toLowerCase()
                 === (String(val).toLowerCase().trim())
        ) {
            newData.push(data[idx]);
        }
    }
    return newData;
}

export const globalFiltering = (data,val) => {
    let newData = [];
    for (let idx in data) {
        for (let i in data[idx]) {
            if (
                String(data[idx][i]).toLowerCase().includes(val.toLowerCase().trim())
            ) {
                newData.push(data[idx]);
                break;
            }
        }
    }
    return newData;
}



// export const sortPendingTop = (data) => {
//     let newData = [];
//     let arrpos = headers.findIndex((x) => x === "Status");
//     function compareByDate(a, b) {
//         let dateA = new Date(a.date);
//         let dateB = new Date(b.date);
//         return dateA - dateB;
//     }
//     for (let idx in data) {
//         if (
//             String(data[idx][arrpos])
//                 .toLowerCase()
//                 .includes(String("pending").toLowerCase().trim())
//         ) {
//             newData.push(data[idx]);
//         }
//     }
//     return newData;
// }