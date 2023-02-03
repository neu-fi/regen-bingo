import { BigNumber } from "ethers"
import { keccak256, toUtf8Bytes } from "ethers/lib/utils"

type Layout = number[][][] // 9 * 3 * 2
let nonce = 0

const generateNextRandom = (): number => {
    nonce += 1
    let a = nonce * 15485863
    return (a * a * a % 2038074743) / 2038074743
}

const isValidLayout = (layout : Layout) : Boolean => {

    let isValidRow = true
    let isValidColumn = true

    for(var i = 0; i < 9; i++) {
        let columnCount = 0
        for(var j = 0; j < 3; j++) {
            if(layout && layout[i] && layout[i][j] && layout[i][j][0] && layout[i][j][0] != 0) {
                columnCount += 1
            }
        }
        if(columnCount == 0) {
            isValidColumn = false
        }
    }

    for(var i = 0; i < 3; i++) {
        let rowCount = 0
        for(var j = 0; j < 9; j++) {
            if(layout && layout[j] && layout[j][i] && layout[j][i][0] && layout[j][i][0] != 0) {
                rowCount += 1
            }
        }
        if(rowCount != 5) {
            isValidRow = false
        }
    }

    return isValidColumn && isValidRow
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
    for(var i = 0; i < 3; i++){
        process.stdout.write('   [')
        for(var j = 0; j < 9; j++){
            if(j < 8) {
                process.stdout.write('[' + writeNumber(layout[j][i][0]) + ',' + writeNumber(layout[j][i][1]) + '], ')
            }
            else {
                if(i < 2) {
                    process.stdout.write('[' + writeNumber(layout[j][i][0]) + ',' + writeNumber(layout[j][i][1]) + ']],\n')
                }
                else {
                    process.stdout.write('[' + writeNumber(layout[j][i][0]) + ',' + writeNumber(layout[j][i][1]) + ']]\n')
                }
            }
        }
    }
    console.log('],')
}


const generateLayout = (): Layout => {
    const layout = [];

    for(var i = 0; i < 9; i++) {
        const r = Math.floor(generateNextRandom() * 8)
        const rr = Math.floor(generateNextRandom() * 8) + 2;

        if (r == 0) {
            layout.push([[0, 0], [0, 0], [0, 0]])
        }

        if (r == 1) {
            if (i == 0) {
                layout.push([[1, 9], [0, 0], [0, 0]])
            }
            else {
                layout.push([[i * 10, 10 + Number(i == 8)], [0, 0], [0, 0]])
            }
        }

        if (r == 2) {
            if (i == 0) {
                layout.push([[0, 0], [1, 9], [0, 0]])
            }
            else {
                layout.push([[0, 0], [i * 10, 10 + Number(i == 8)], [0, 0]])
            }
        }

        if (r == 3) {
            if (i == 0) {
                layout.push([[0, 0], [0, 0], [1, 9]])
            }
            else {
                layout.push([[0, 0], [0, 0], [i * 10, 10 + Number(i == 8)]])
            }
        }

        if (r == 4) {
            if (i == 0) {
                layout.push([[1, rr - 1], [rr, 10 - rr], [0, 0]])
            }
            else {
                layout.push([[i * 10, rr], [i * 10 + rr, 10 - rr + Number(i == 8)], [0, 0]])
            }
        }

        if (r == 5) {
            if (i == 0) {
                layout.push([[0, 0], [1, rr - 1], [rr, 10 - rr]])
            }
            else {
                layout.push([[0, 0], [i * 10, rr ], [i * 10 + rr, 10 - rr + Number(i == 8)]])
            }
        }

        if (r == 6) {
            if (i == 0) {
                layout.push([[1, rr - 1], [0, 0], [rr, 10 - rr]])
            }
            else {
                layout.push([[i * 10, rr], [0, 0], [i * 10 + rr, 10 - rr + Number(i == 8)]])
            }
        }

        if (r == 7) {
            if(i == 0) {
                layout.push([[1, 3], [4, 3], [7, 3]])
            }
            else if(i == 8) {
                layout.push([[80, 4], [84, 4], [88, 3]])
            }
            else {
                layout.push([[i * 10, 3], [i * 10 + 3, 3], [i * 10 + 6, 4]])
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

    for(var i = 0; i < 3; i++) {
        for(var j = 0; j < 9; j++) {
            if(layout && layout[j] && layout[j][i] && layout[j][i][0] && layout[j][i][0] != 0) {
                
                bits += fixBitLength(i.toString(2), 2) // 2 bits for the rows
                bits += fixBitLength(j.toString(2), 4) // 4 bits for the columns
                bits += fixBitLength(layout[j][i][0].toString(2), 7) // 7 bits for the range index
                bits += fixBitLength(layout[j][i][1].toString(2), 4) // 4 bits for the number range length
                
            }
        }
    }

    return bits.split('').reverse().join('');
}

const generateBigNumberFromBits = (bits: String): BigNumber => {
    let number = BigNumber.from('1') // for leading zeroes

    for(var i = 0; i < bits.length; i++) {
        number = number.mul(2)
        if(bits[i] == '1') {
            number = number.add(1)
        }
        //console.log(bits[i] == '1')
    }

    return number
}

const generateCardFromLayout = (layout: BigNumber, tokenSeed: number): number[][] => {
    let card = []
    for(var i = 0; i < 3; i++) {
        card.push([0,0,0,0,0,0,0,0,0])
    }

    for(var i = 0; i < 15; i++) {
        const row = Number(layout.mod(4)) // 2 bit
        layout = layout.div(4)
        const column = Number(layout.mod(16)) // 4 bit
        layout = layout.div(16)
        const floorNumber = Number(layout.mod(128)) // 7 bit
        layout = layout.div(128)
        const range = Number(layout.mod(16)) // 4 bit
        layout = layout.div(16)
        card[row][column] = (floorNumber + tokenSeed % range)
    }

    return card
}


function main() {
    let counter = 0;
    const layouts: Array<Layout> = [];
    const bits: Array<String> = [];
    const numbers: Array<BigNumber> = [];
    console.log("Layouts: \n")

    while(counter < 10) {
        const layout: Layout = generateLayout()
        if(isValidLayout(layout) && !layouts?.includes(layout)) {
            layouts.push(layout)
            counter += 1
            layoutWriter(layout)

            const bit: String = generateBitsFromLayout(layout)
            bits.push(bit) // first 17 character for last number (4 for range, 7 for range start, 4 for column, 2 for row) !reversed

            const layoutNumber: BigNumber = generateBigNumberFromBits(bit)
            numbers.push(layoutNumber)
        }
    }
    console.log("\nBinary forms of layouts: \n")

    bits.map((b) => {
        console.log(b, '\n')
    })

    console.log("\nNumber forms of layouts: \n");
    numbers.map((number) => {
        console.log(number.toString())
    })
    
    console.log('\nTest Card: \n', generateCardFromLayout(numbers[0], 128739456)) // layout, tokenSeed
    // console.log(Number(generateBigNumberFromBits("001"))) // expected 9
}

main()