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
    clicks = 0;

    constructor(coords, distance, duration){
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    _setDiscription(){
        const months = ['January', 'Fabruary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} On ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
    // _click(){
    //     this.clicks++
    // }
}

class Running extends Workout{
    type = 'running'
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace()
        this._setDiscription()
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
        this._setDiscription()
    }

    clacSpeed(){
        this.speed = this.distance / (this.duration / 60) ;
        return this.speed
    }
}


class App{
    #map;
    #mapEvent;
    #workouts = []
    
    constructor(){ 
        this._getPosition()

        // local storage
        this._getLocalStorage() 

        form.addEventListener('submit', this._newWorkout.bind(this))     
        inputType.addEventListener('change', this._toggleElevationField)
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
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

            this.#workouts.forEach(element => {
                this._renderWorkoutMarker(element)
            });

    }
    _showForm(mapE){
            this.#mapEvent = mapE
            form.classList.remove('hidden');
            inputDistance.focus()
    }
    _hideForm(){
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        form.classList.add('hidden')
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
        this.#workouts.push(workout)
        
        // display map
        this._renderWorkoutMarker(workout)

        // render workout
        this._renderWorkout(workout)
        // clearing field
        this._hideForm()    
        //local storage
        this._setLocalStorage() 
    }
    _renderWorkoutMarker(workout){
        
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
        .setPopupContent(`${workout.type === 'running' ? '?????????????' : '?????????????'} ${workout.discription}`)
        .openPopup();
    }
    _renderWorkout(workout){
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.discription}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '?????????????' : '?????????????'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">???</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        `;

        if(workout.type === 'running')
            html +=
             `
            <div class="workout__details">
                <span class="workout__icon">??????</span>
                <span class="workout__value">${workout.pace}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">????????</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
            </li>
            `;
        

        if(workout.type === 'cycling')
            html +=`
            <div class="workout__details">
                <span class="workout__icon">??????</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">???</span>
                <span class="workout__value">${workout.elevationGain}</span>
                <span class="workout__unit">m</span>
            </div>
            </li>
            `;
        form.insertAdjacentHTML('afterend', html)
    }
    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout');
        if(!workoutEl) return
        console.log(workoutEl)

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id)
        console.log(workout)

        this.#map.setView(workout.coords, 13, {animate: true, pan:{duration: 1}})
        // workout._click()
    }
    _setLocalStorage(){
        localStorage.setItem('workout', JSON.stringify(this.#workouts))
    }
    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workout'))
        console.log(data)
        if(!data) return
        this.#workouts = data;
        this.#workouts.forEach(element => {
            this._renderWorkout(element)
            console.log(element)
        });
    }
    clearLocalStorage(){
        localStorage.removeItem('workout')
        location.reload()
    }
}
const app = new App();