import { BigNumber } from "ethers"

type Layout = number[][][] // 9 * 3 * 2
let nonce = 0
const layoutCount = 10


// Used this algorithm to generate pseudorandom numbers: https://en.wikipedia.org/wiki/Pseudorandom_number_generator#Implementation
const generateNextRandom = (): number => {
    nonce += 1
    let a = nonce * 15485863
    return (a * a * a % 2038074743) / 2038074743
}

const isValidColumn = (column: number[][], columnIndex: number) : Boolean => {
    let columnOptionsCount = 0
    let sumOfOptionsInColumn = 0
    const optionsInColumn: number[] = [] 

    for(let rowIndex = 0; rowIndex < 3; rowIndex++) {
        if(column![rowIndex]![0] && column[rowIndex][0] != 0) {
            columnOptionsCount += 1
            sumOfOptionsInColumn += column[rowIndex][1]
            for (let range = 0; range < column[rowIndex][1]; range++) {
                if(optionsInColumn.includes(column[rowIndex][0] + range)) {
                    return false // checking for overlapping numbers
                }
                optionsInColumn.push(column[rowIndex][0] + range)
            }
        }
    }
    // checking for a column has at least one number
    if(columnOptionsCount == 0) return false

    // checking for validity of column
    if(columnIndex == 0 )
        return (sumOfOptionsInColumn == 9 && optionsInColumn.length == 9)

    else if(columnIndex == 8)
        return (sumOfOptionsInColumn == 11 && optionsInColumn.length == 11)
    
    else return sumOfOptionsInColumn == 10 && optionsInColumn.length == 10
}


const hasValidRows = (layout: Layout) : Boolean => {
    for(let rowIndex = 0; rowIndex < 3; rowIndex++) {
        let rowOptionsCount = 0

        for(let columnIndex = 0; columnIndex < 9; columnIndex++) {
            if(layout![columnIndex]![rowIndex]![0] && layout[columnIndex][rowIndex][0] != 0) {
                rowOptionsCount += 1
            }
        }
        if(rowOptionsCount != 5) {
            return false
        }
    }

    return true
}


const hasAnyOverlappingNumberInAllLayout = (layout: Layout): Boolean => {
    const allNumbers: number[] = []

    for(let rowIndex = 0; rowIndex < 3; rowIndex++) {
        for(let columnIndex = 0; columnIndex < 9; columnIndex++) {
            if(layout![columnIndex]![rowIndex]![0] && layout[columnIndex][rowIndex][0] != 0) {
                for(let range = 0; range < layout[columnIndex][rowIndex][1]; range++) {
                    if(allNumbers.includes(layout[columnIndex][rowIndex][0] + range)) {
                        return false
                    }
                    allNumbers.push(layout[columnIndex][rowIndex][0] + range)
                }
            }
        }
    }

    return true
}

const hasAllNumbersBetweenOneAndNinety = (layout: Layout): Boolean => {
    const allNumbers: number[] = []

    for(let rowIndex = 0; rowIndex < 3; rowIndex++) {
        for(let columnIndex = 0; columnIndex < 9; columnIndex++) {
            if(layout![columnIndex]![rowIndex]![0] && layout[columnIndex][rowIndex][0] != 0) {
                for(let range = 0; range < layout[columnIndex][rowIndex][1]; range++) {
                    allNumbers.push(layout[columnIndex][rowIndex][0] + range)
                }
            }
        }
    }

    for(let number = 1; number <= 90; number++) {
        if(!allNumbers.includes(number)) {
            return false
        }
    }

    return true
}


const isValidLayout = (layout : Layout) : Boolean => {
    for(let columnIndex = 0; columnIndex < 9; columnIndex++) {
        if(!isValidColumn(layout![columnIndex], columnIndex)) {
            return false
        }
    }

    return hasValidRows(layout) && hasAnyOverlappingNumberInAllLayout(layout) && hasAllNumbersBetweenOneAndNinety(layout)
}


const writeNumber = (number: Number): String => {
    if(number < 10) {
        return ' ' + String(number)
    }
    else {
        return String(number)
    }  
}


function layoutWriter(layout: Layout){
    console.log('[')
    for(let rowIndex = 0; rowIndex < 3; rowIndex++){
        process.stdout.write('   [')
        for(let columnIndex = 0; columnIndex < 9; columnIndex++){
            if(columnIndex < 8) {
                process.stdout.write('[' + writeNumber(layout[columnIndex][rowIndex][0]) + ',' + writeNumber(layout[columnIndex][rowIndex][1]) + '], ')
            }
            else {
                if(rowIndex < 2) {
                    process.stdout.write('[' + writeNumber(layout[columnIndex][rowIndex][0]) + ',' + writeNumber(layout[columnIndex][rowIndex][1]) + ']],\n')
                }
                else {
                    process.stdout.write('[' + writeNumber(layout[columnIndex][rowIndex][0]) + ',' + writeNumber(layout[columnIndex][rowIndex][1]) + ']]\n')
                }
            }
        }
    }
    console.log('],')
}


const generateLayout = (): Layout => {
    const layout = [];

    for(let columnIndex = 0; columnIndex < 9; columnIndex++) {
        const r = Math.floor(generateNextRandom() * 8)
        const rr = Math.floor(generateNextRandom() * 8) + 2;

        if (r == 0) {
            layout.push([[0, 0], [0, 0], [0, 0]])
        }

        if (r == 1) {
            if (columnIndex == 0) {
                layout.push([[1, 9], [0, 0], [0, 0]])
            }
            else {
                layout.push([[columnIndex * 10, 10 + Number(columnIndex == 8)], [0, 0], [0, 0]])
            }
        }

        if (r == 2) {
            if (columnIndex == 0) {
                layout.push([[0, 0], [1, 9], [0, 0]])
            }
            else {
                layout.push([[0, 0], [columnIndex * 10, 10 + Number(columnIndex == 8)], [0, 0]])
            }
        }

        if (r == 3) {
            if (columnIndex == 0) {
                layout.push([[0, 0], [0, 0], [1, 9]])
            }
            else {
                layout.push([[0, 0], [0, 0], [columnIndex * 10, 10 + Number(columnIndex == 8)]])
            }
        }

        if (r == 4) {
            if (columnIndex == 0) {
                layout.push([[1, rr - 1], [rr, 10 - rr], [0, 0]])
            }
            else {
                layout.push([[columnIndex * 10, rr], [columnIndex * 10 + rr, 10 - rr + Number(columnIndex == 8)], [0, 0]])
            }
        }

        if (r == 5) {
            if (columnIndex == 0) {
                layout.push([[0, 0], [1, rr - 1], [rr, 10 - rr]])
            }
            else {
                layout.push([[0, 0], [columnIndex * 10, rr ], [columnIndex * 10 + rr, 10 - rr + Number(columnIndex == 8)]])
            }
        }

        if (r == 6) {
            if (columnIndex == 0) {
                layout.push([[1, rr - 1], [0, 0], [rr, 10 - rr]])
            }
            else {
                layout.push([[columnIndex * 10, rr], [0, 0], [columnIndex * 10 + rr, 10 - rr + Number(columnIndex == 8)]])
            }
        }

        if (r == 7) {
            if(columnIndex == 0) {
                layout.push([[1, 3], [4, 3], [7, 3]])
            }
            else if(columnIndex == 8) {
                layout.push([[80, 4], [84, 4], [88, 3]])
            }
            else {
                layout.push([[columnIndex * 10, 3], [columnIndex * 10 + 3, 3], [columnIndex * 10 + 6, 4]])
            }
        }
    }
    return layout
}

const fixBitLength = (bits: String, len: number): String => {
    let fixedBits = bits.split('').reverse().join('')
    const numberOfZeroes = len - bits.length > 0 ? len - bits.length : 0
    fixedBits += '0'.repeat(numberOfZeroes)
    return fixedBits
}

const generateBitsFromLayout = (layout: Layout): String => {
    let bits = ''

    for(let rowIndex = 0; rowIndex < 3; rowIndex++) {
        for(let columnIndex = 0; columnIndex < 9; columnIndex++) {
            if(layout![columnIndex]![rowIndex]![0] && layout[columnIndex][rowIndex][0] != 0) {
                
                bits += fixBitLength(rowIndex.toString(2), 2) // 2 bits for the rows
                bits += fixBitLength(columnIndex.toString(2), 4) // 4 bits for the columns
                bits += fixBitLength(layout[columnIndex][rowIndex][0].toString(2), 7) // 7 bits for the range index
                bits += fixBitLength(layout[columnIndex][rowIndex][1].toString(2), 4) // 4 bits for the number range length
                
            }
        }
    }

    return bits.split('').reverse().join('');
}

const generateBigNumberFromBits = (bits: String): BigNumber => {
    let number = BigNumber.from('1') // for leading zeroes

    for(let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
        number = number.mul(2)
        if(bits[bitIndex] == '1') {
            number = number.add(1)
        }
    }

    return number
}

const generateCardFromLayout = (layout: BigNumber, tokenSeed: number): number[][] => {
    let card = []
    for(let rowIndex = 0; rowIndex < 3; rowIndex++) {
        card.push([0,0,0,0,0,0,0,0,0])
    }

    for(let numberIndex = 0; numberIndex < 15; numberIndex++) {
        const row = Number(layout.mod(4)) // getting last 2 bit by modulo 4
        layout = layout.div(4) // getting rid of last 2 bit by dividing the number with 4
        const column = Number(layout.mod(16))
        layout = layout.div(16)
        const floorNumber = Number(layout.mod(128))
        layout = layout.div(128)
        const range = Number(layout.mod(16))
        layout = layout.div(16)
        card[row][column] = (floorNumber + tokenSeed % range)
    }

    return card
}


function main() {
    let counter = 0;
    const layouts: Array<Layout> = [];
    const bitsArray: Array<String> = [];
    const numbersArray: Array<BigNumber> = [];

    console.log("Layouts: \n")
    while(counter < layoutCount) {
        const layout: Layout = generateLayout()
        if(isValidLayout(layout) && !layouts?.includes(layout)) {
            layouts.push(layout)
            counter += 1
            layoutWriter(layout)

            const bits: String = generateBitsFromLayout(layout)
            bitsArray.push(bits) // first 17 character for last number (4 for range, 7 for range start, 4 for column, 2 for row) !reversed

            const layoutNumber: BigNumber = generateBigNumberFromBits(bits)
            numbersArray.push(layoutNumber)
        }
    }

    console.log("\nBinary forms of layouts: \n")
    bitsArray.map((b) => {
        console.log(b, '\n')
    })

    console.log("\nNumber forms of layouts: \n");
    numbersArray.map((number) => {
        console.log(number.toString())
    })
    
    console.log("\nExpected cards for each layout with random token seeds: \n")
    numbersArray.map((number) => {
        const tokenSeed = Math.floor(generateNextRandom() * 1e10)

        console.log("Layout number: ", number.toString())
        console.log("Token seed: ", tokenSeed.toString())
        console.log(generateCardFromLayout(numbersArray[0], tokenSeed), "\n") // layout, tokenSeed
    })
}

main()