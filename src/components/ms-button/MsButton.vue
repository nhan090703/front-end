<template>
    <button>
        <slot></slot>
    </button>
</template>

<style scoped>
button{
    transition: all .2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    outline: none;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    height: 28px;
    font-weight: 500;
    border: 0px;
}
</style>