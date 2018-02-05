import $ from "jquery";

import { shift, sum } from "~client/sum";

const shiftText: string = "Hello, World!";
const shiftElement: JQuery<HTMLElement> = $("<p>");
shiftElement.text(`${shiftText} shifts to ${shift(shiftText)}`);

const numArr: number[] = [12, 24, 5, 7, 8, 9, 5, 4, 345, 6, 7, 2, 1, 89381759823749183247];
const sumElement: JQuery<HTMLElement> = $("<p>");
sumElement.text(`The sum of "${numArr.join(" + ")}" is ${sum(...numArr)}`);

$("#app").append(shiftElement);
$("#app").append(sumElement);
