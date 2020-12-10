import { ComponentOptions, DataDef, RecordPropsDefinition } from 'vue/types/options'
import { AsyncComputedGetter, IAsyncComputedValue, IASyncComputedState } from 'vue-async-computed'

export type AsyncComputedObject<T> = {
    [K in keyof T]: AsyncComputedGetter<T[K]> | IAsyncComputedValue<T[K]>;
}

export type AsyncComputedStates<T> = {
    $asyncComputed: { [K in keyof T]: IASyncComputedState };
}


export interface AsyncComputedOption<T> {
    asyncComputed?: AsyncComputedObject<T>;
}

declare module 'vue/types/vue' {
    interface VueConstructor<V extends Vue = Vue> {
        extend<Data, Methods, Computed, PropNames extends string = never, AsyncComputed = {}>(options?:
            object &
            ComponentOptions<V, DataDef<Data, Record<PropNames, any>, V>, Methods, Computed, PropNames[], Record<PropNames, any>> &
            AsyncComputedOption<AsyncComputed> &
            ThisType<CombinedVueInstance<V, Data, Methods, Computed & AsyncComputed & AsyncComputedStates<AsyncComputed>, Readonly<Record<PropNames, any>>>>
        ): ExtendedVue<V, Data, Methods, Computed & AsyncComputed & AsyncComputedStates<AsyncComputed>, Record<PropNames, any>>;

        extend<Data, Methods, Computed, Props, AsyncComputed = {}>(options?:
            object &
            ComponentOptions<V, DataDef<Data, Props, V>, Methods, Computed, RecordPropsDefinition<Props>, Props> &
            AsyncComputedOption<AsyncComputed> &
            ThisType<CombinedVueInstance<V, Data, Methods, Computed & AsyncComputed & AsyncComputedStates<AsyncComputed>, Readonly<Props>>>
        ): ExtendedVue<V, Data, Methods, Computed & AsyncComputed & AsyncComputedStates<AsyncComputed>, Props>;
    }
}
