export function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export function secondStringToDate(sec : string){
  const seconds: number = +sec
  const miliseconds = seconds * 1000
  const dateOfDrawn = new Date(miliseconds)
  return dateOfDrawn;
}

export function calcTimeDifference(dateOfDraw: any, dateOfNow: any){
  let difference  = Math.floor((dateOfDraw - dateOfNow) / 1000)
  return difference
}

export const addZero = (date: string) => {
  if(date.length == 0){
    return "00"
  }
  if(date.length <= 1){
    return "0" + date
  }
  return date
}

export function secondsToDate(difference: number){
  if(difference  < 0){
    return "Regen Bingo countdown has been finished"
  }
  else{
    const seconsds = Math.floor(difference % 60)
    difference /= 60
    const minutes = Math.floor(difference % 60)
    difference /= 60
    const hours = Math.floor(difference % 24)
    const days = Math.floor(difference / 24)
    return addZero(days.toString()) + " Days, " + addZero(hours.toString()) + " Hours, " + addZero(minutes.toString()) + " Minutes, " + addZero(seconsds.toString()) + " Seconds";

  }
}