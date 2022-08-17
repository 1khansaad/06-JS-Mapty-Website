'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

class Workout{
    date = new Date()
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration){
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
}

class Running extends Workout{
    type = 'running'
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace()
    }
    
    calcPace(){
        this.pace = this.duration / this.distance;
        return this.pace
    }
}
class Cycling extends Workout{
    type = 'cycling'
    constructor(coords, distance, duration, elevationGain){
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.clacSpeed()
    }

    clacSpeed(){
        this.speed = this.distance / (this.duration / 60) ;
        return this.speed
    }
}


class App{
    #map;
    #mapEvent;
    #workout = []
    constructor(){ 
        this._getPosition()
        form.addEventListener('submit', this._newWorkout.bind(this))     
        inputType.addEventListener('change', this._toggleElevationField)
    }
    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this) , function(){
                console.log('could not get your position')
            })   
        }
    }

    _loadMap(position){
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`)
    
            const coordsArr = [latitude, longitude]
    
           this.#map = L.map('map').setView(coordsArr, 13);
    
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
    
            L.marker(coordsArr).addTo(this.#map)
                .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
                .openPopup();

            this.#map.on('click', this._showForm.bind(this))
    }
    _showForm(mapE){
            this.#mapEvent = mapE
            form.classList.remove('hidden');
            inputDistance.focus()
    }
    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }
    _newWorkout(e){
        e.preventDefault();
        
        // get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // if workout running
        if(type === 'running'){
            const cadence = +inputCadence.value;
            // check if data is valid
            if(!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence) || distance < 0 || duration < 0 || cadence < 0) return alert('input value should be positive number')

            workout = new Running([lat , lng], distance, duration, cadence)
        }

        // if workout is cycling
        if(type === 'cycling'){
            const elevation = +inputElevation.value;
            // check if data is valid
            if(!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(elevation) ||  distance < 0 || duration < 0) return alert('input value should be positive number')

            workout = new Cycling([lat , lng], distance, duration, elevation)  
        }
        this.#workout.push(workout)
        
        // display map
        this.renderWorkoutMarker(workout)
        // clearing field
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';            
    }
    renderWorkoutMarker(workout){
        
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(
         L.popup({
         maxWidth: 250,
         minWidth: 100,
         autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
        })
        )
        .setPopupContent('workout')
        .openPopup();
    }
}
const app = new App();

