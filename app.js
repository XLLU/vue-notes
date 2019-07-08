const Editor = {
	props: [
		"entityObject"
	], 
	data() {
		return {
			entity: this.entityObject
		}
	}, 
	methods: {
		update() {
			this.$emit('update')
		}
	}, 
	template: `
		<div class="ui form">
			<div class="ui field">
				<textarea rows="5" placeholder="Write something... " 
					v-model="entity.body"
					v-on:input="update">
				</textarea>
			</div>
		</div>
	`
}


const Note = {
	props: [
		'entityObject'
	], 
	data() {
		return {
			entity: this.entityObject, 
			open: false
		}
	}, 
	computed: {
		header() {
			return _.truncate(this.entity.body, {length: 30})
		}, 
		
		updated() {
			return moment(this.entity.meta.updated).fromNow()
		}, 
		
		word() {
			return this.entity.body.trim().length
		}
	}, 
	components: {
		'editor': Editor
	}, 
	methods: {
		save() {
			loadCollection('notes')
				.then((collection) => {
					collection.update(this.entity)
					db.saveDatabase()
				})
		},
		
		destroy() {
			console.log(this.entity.$loki)
			this.$emit('destroy', this.entity.$loki)
		}
	}, 
	template: `
		<div class="item">
			<div class="meta">{{ updated }}</div>
			<div class="content">
				<div class="header" @click="open=!open">
					{{ header }}
				</div>
				
				<div class="extra">
					<editor v-bind:entity-object="entity"
						v-if="open"
						v-on:update="save"
					>
					</editor>
					<i class="right floated trash alternate icon"
						v-if="open"
						v-on:click="destroy">
					</i>
				</div>
				
				<div class="meta">
					共<b>{{ word }}</b>字
				</div>
			</div>
		</div>
	`
}

const Notes = {
	data() {
		return {
			entities: []
		}
	},
	
	created() {
		loadCollection('notes')
			.then(collection => {
				// console.log(collection)
				const _entities = collection.chain()
					.find()
					.simplesort('$loki', 'isdesc')
					.data()
				this.entities = _entities
				console.log(this.entities)
			})
	}, 
	components: {
		'note': Note
	}, 
	methods: {
		create() {
			loadCollection('notes')
				.then((collection => {
					const entity = collection.insert({
						body: 'New Note'
					})
					db.saveDatabase() 
					this.entities.unshift(entity)
				}))
		}, 
		destroy(id) {
			const _entities = this.entities.filter((entity) => {
				return entity.$loki !== id
			})
			
			this.entities = _entities
			
			loadCollection('notes')
				.then((collection) => {
					collection.remove({'$loki': id})
					db.saveDatabase()
				})
		}
	}, 
	template: `
	<div class="ui container notes">
		<h4 class="ui horizontal divider header">
			<i class="paw icon"></i>
			Vue Notes
		</h4>
		<a class="ui right floated basic vilet button"
			@click="create">
			Add Note
		</a>
		<div class="ui divided items">
			<note v-for="entity in entities"
				v-bind:entityObject="entity"
				v-bind:key="entity.$loki"
				v-on:destroy="destroy"
				></note>
		</div>
	</div>
	`
}

const app = new Vue({
	el: '#app',
	components: {
		'notes': Notes
	},
	template: `
	<notes></notes>
	`
})