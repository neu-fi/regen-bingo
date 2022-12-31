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

export function secondsToDate(difference: number){
  if(difference  < 0){
    return "Expired"
  }
  else{
    const seconsds = Math.floor(difference % 60)
    difference /= 60
    const minutes = Math.floor(difference % 60)
    difference /= 60
    const hours = Math.floor(difference % 24)
    const days = Math.floor(difference / 24)
    return days.toString() + " Days, " + hours.toString() + " Hours, " + minutes.toString() + " Minutes, " + seconsds.toString() + " Seconds";

  }
}