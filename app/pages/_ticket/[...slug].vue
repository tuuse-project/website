<template>

    <div class="ticket-overlay" v-if="!ticketData.error">
        <div class="ticket-number">
            #{{ ticketData.ticketNumber }}
        </div>
        <div class="ticket-logo">
            
        </div>
        <br>
        <div class="ticket-qr">
            <img :src="`https://api.qrserver.com/v1/create-qr-code/?data=${ticketData.token}&amp;size=200x200`" alt="">
        </div>
        <br>
        <div class="ticket-text">
            YOUR SPECIAL INVITATION
        </div>
    </div>
    <div class="error" v-else>
        <center>
            <h1>
                404
                <br>
                <br></br>
                TICKET NOT FOUND
            </h1>
            <br>
            <p>Given url is invalid or ticket is no longer available</p>

        </center>
       
    </div>
   

</template>
<script setup>
import { jwtDecode } from 'jwt-decode'

useHead({
    title: 'Your Special Invitation'
})
const route = useRoute()

const ticketData = ref({})
try {
    ticketData.value = jwtDecode(route.params.slug[0] )
} catch {
    ticketData.value = {
        error: true
    }
}
</script>
<style scoped>
    .ticket-overlay {
        margin: 0 auto; 
        padding: 2rem;
        max-width: 40rem;
        background-image: url('~/assets/images/ticket-bg.jpg');
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .ticket-number {
        /* font-family: 'TUUSE'; */
        font-weight: bold;
        width: 100%;
        text-align: start;
    }

    .ticket-logo {
        width: 100%;
        height: 5rem;
        background-image: url('~/assets/images/logo.png');
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        transform: scale(2);
    }

    .ticket-qr {
        background-color: rgb(255 255 255);
        padding: 0.5rem;
        border-radius: 0.5rem;
    }

    h1 {
        font-size: 2rem
    }
</style>