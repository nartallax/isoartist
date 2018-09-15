import {Mutator as IMutator} from "interfaces"
import { Mutator as A } from "mutators/random_cuboids/mutator"
import { Mutator as B } from "mutators/zero_floor_plain/mutator"
export const list = [
new A(),
new B()
] as IMutator[]