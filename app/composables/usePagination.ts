import { ref, computed, type Ref } from "vue";

export const usePagination = <T>(dataList: Ref<T[]>, defaultPerPage = 10) => {
    const perPage = ref(defaultPerPage);
    const currentPage = ref(1);

    const totalItems = computed(() => dataList.value.length);
    const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value) || 1);

    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * perPage.value;
        const end = start + perPage.value;
        return dataList.value.slice(start, end);
    });

    function changePage(page: number) {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    }

    return {
        perPage,
        currentPage,
        totalPages,
        totalItems,
        paginatedData,
        changePage
    };
};