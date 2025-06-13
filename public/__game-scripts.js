// follow-camera.js
var FollowCamera = pc.createScript('followCamera');

FollowCamera.attributes.add('target', {
    type: 'entity',
    description: 'Target to follow'
});

FollowCamera.attributes.add('distance', {
    type: 'number',
    default: 5,
    description: 'Distance from target'
});

FollowCamera.attributes.add('rotateSpeed', {
    type: 'number',
    default: 0.3,
    description: 'Rotation speed'
});

// Initialize
FollowCamera.prototype.initialize = function() {
    this.euler = new pc.Vec3(0, 0, 0);
    this.mouseDown = false;
    
    // Mouse events
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    
    // Initialize camera position
    this.updateCameraPosition();
};

// Mouse down
FollowCamera.prototype.onMouseDown = function(event) {
    if (event.button === pc.MOUSEBUTTON_LEFT) {
        this.mouseDown = true;
    }
};

// Mouse up
FollowCamera.prototype.onMouseUp = function(event) {
    if (event.button === pc.MOUSEBUTTON_LEFT) {
        this.mouseDown = false;
    }
};

// Mouse move
FollowCamera.prototype.onMouseMove = function(event) {
    if (!this.mouseDown || !this.target) return;
    
    this.euler.y -= event.dx * this.rotateSpeed;
    this.euler.x -= event.dy * this.rotateSpeed;
    this.euler.x = pc.math.clamp(this.euler.x, -90, 90);
    
    this.updateCameraPosition();
};

// Update camera position
FollowCamera.prototype.updateCameraPosition = function() {
    if (!this.target) return;
    
    // Calculate rotation from angles
    var rot = new pc.Quat();
    rot.setFromEulerAngles(this.euler.x, this.euler.y, 0);
    
    // Calculate forward direction
    var forward = new pc.Vec3(0, 0, -1);
    forward = rot.transformVector(forward);
    
    // Set camera position
    var targetPos = this.target.getPosition();
    var cameraPos = new pc.Vec3();
    cameraPos.copy(targetPos);
    cameraPos.sub(forward.scale(this.distance));
    
    this.entity.setPosition(cameraPos);
    this.entity.lookAt(targetPos);
};

// movement.js
var Movement = pc.createScript('movement');

Movement.attributes.add('speed', {
    type: 'number',
    default: 0.1,
    min: 0.05,
    max: 0.5,
    precision: 2,
    description: 'Controls the movement speed'
});

// Initialize code called once per entity
Movement.prototype.initialize = function() {
    this.force = new pc.Vec3();
    this.spawnPos = this.entity.getPosition().clone();
};

// Update code called every frame
Movement.prototype.update = function(dt) {
    // If the player falls off a platform, teleport to the last location.
    const pos = this.entity.getPosition();
    if (pos.y < -1) {
        this.teleport(this.spawnPos);
        return;
    }

    const keyboard = this.app.keyboard;
    let forceX = 0;
    let forceZ = 0;

    // Calculate force based on pressed keys
    if (keyboard.isPressed(pc.KEY_LEFT) || keyboard.isPressed(pc.KEY_A)) {
        forceX = -this.speed;
    }

    if (keyboard.isPressed(pc.KEY_RIGHT) || keyboard.isPressed(pc.KEY_D)) {
        forceX += this.speed;
    }

    if (keyboard.isPressed(pc.KEY_UP) || keyboard.isPressed(pc.KEY_W)) {
        forceZ = -this.speed;
    }

    if (keyboard.isPressed(pc.KEY_DOWN) || keyboard.isPressed(pc.KEY_S)) {
        forceZ += this.speed;
    }

    this.force.set(forceX, 0, forceZ);

    // If we have some non-zero force
    if (this.force.lengthSq() > 0) {

        // Normalize the force vector
        this.force.normalize().scale(this.speed);

        // Apply rotation to the force vector
        const angle = -Math.PI * 0.25;  // 45 degrees in radians
        const rx = Math.cos(angle);
        const rz = Math.sin(angle);
        const forceX = this.force.x * rx - this.force.z * rz;
        const forceZ = this.force.z * rx + this.force.x * rz;

        this.force.set(forceX, 0, forceZ);
    }

    // Apply impulse to move the entity
    this.entity.rigidbody.applyImpulse(this.force);
};

Movement.prototype.teleport = function(pos) {
    // move ball to that point
    this.entity.rigidbody.teleport(pos);
    this.spawnPos.copy(pos);

    // need to reset angular and linear forces
    this.entity.rigidbody.linearVelocity = pc.Vec3.ZERO;
    this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;            
};


// teleporter.js
var Teleporter = pc.createScript('teleporter');

Teleporter.attributes.add('target', {
    type: 'entity',
    title: 'Target Entity',
    description: 'The target entity where we are going to teleport'
});

// initialize code called once per entity
Teleporter.prototype.initialize = function() {
    const onTriggerEnter = (otherEntity) => {
        // If the entity entering the trigger has the movement script...
        if (otherEntity.script.movement) {
            // ...teleport that entity to the target entity
            const targetPos = this.target.getPosition().clone();
            targetPos.y += 0.5;
            otherEntity.script.movement.teleport(targetPos);
        }
    };

    // Subscribe to the triggerenter event of this entity's collision component.
    // This will be fired when a rigid body enters this collision volume.
    this.entity.collision.on('triggerenter', onTriggerEnter);

    // And unsubscribe if the teleporter is destroyed
    this.on('destroy', () => {
        this.entity.collision.off('triggerenter', onTriggerEnter);
    });
};


// camera.js
var Camera = pc.createScript('camera');

// initialize code called once per entity
Camera.prototype.initialize = function() {

};

// update code called every frame
Camera.prototype.update = function(dt) {

};

// uncomment the swap method to enable hot-reloading for this script
// update the method body to copy state from the old instance
// Camera.prototype.swap = function(old) { };

// learn more about scripting here:
// https://developer.playcanvas.com/user-manual/scripting/

// camera_orbit.js
var CameraOrbit = pc.createScript('cameraOrbit');

CameraOrbit.attributes.add('distance', {
    type: 'number',
    default: 10,
    title: 'Дистанция от цели'
});

CameraOrbit.attributes.add('target', {
    type: 'entity',  // Важно: тип должен быть 'entity'!
    title: 'Target'
});

// Инициализация
CameraOrbit.prototype.initialize = function() {
    this.euler = new pc.Vec3(0, 0, 0);
    this.mouseDown = false;

    // Обработчики событий мыши
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
};

// Нажатие кнопки мыши
CameraOrbit.prototype.onMouseDown = function(event) {
    this.mouseDown = true;
};

// Отпускание кнопки мыши
CameraOrbit.prototype.onMouseUp = function(event) {
    this.mouseDown = false;
};

// Движение мыши
CameraOrbit.prototype.onMouseMove = function(event) {
    if (!this.mouseDown || !this.target) return;

    // Вращение камеры при зажатой ЛКМ
    this.euler.x -= event.dy * 0.2;
    this.euler.y -= event.dx * 0.2;
    this.euler.x = pc.math.clamp(this.euler.x, -90, 90); // Ограничение угла

    // Обновление позиции камеры
    this.updateCameraPosition();
};

// Обновление позиции камеры
CameraOrbit.prototype.updateCameraPosition = function() {
    if (!this.target) return;

    // Вычисляем позицию камеры через углы Эйлера
    var position = new pc.Vec3();
    position.copy(this.target.getPosition());

    // Смещение камеры на заданное расстояние
    var q = new pc.Quat();
    q.setFromEulerAngles(this.euler.x, this.euler.y, 0);
    position.add(q.getForward().scale(-this.distance));

    // Применяем позицию и направление
    this.entity.setPosition(position);
    this.entity.lookAt(this.target.getPosition());
};

// follow-camera2.js
var FollowCamera2 = pc.createScript('followCamera2');

FollowCamera2.attributes.add('distanceFromTarget', { type: 'number', default: 0.5 });
FollowCamera2.attributes.add('yawSpeed', { type: 'number', default: 0.5 });
FollowCamera2.attributes.add('pitchSpeed', { type: 'number', default: 0.5 });
FollowCamera2.attributes.add('keyboardSpeed', { type: 'number', default: 1 });
FollowCamera2.attributes.add('edgeThreshold', { 
    type: 'number', 
    default: 50, 
    description: 'Пиксели от края для активации поворота' 
});

FollowCamera2.attributes.add('edgeSpeed', { 
    type: 'number', 
    default: 35
});

// Инициализация
FollowCamera2.prototype.initialize = function() {
    this.yaw = 0;
    this.pitch = 0;
    this.isDragging = false;
    
    // Мышь и клавиатура
    this.isMouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.keys = {};
    
    // Настройка позиции камеры
    this.pivotPoint = new pc.Vec3(1, 1.2, 1.5);
    
    // Привязываем события мыши
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    
    // Привязываем события клавиатуры
    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
    this.app.keyboard.on(pc.EVENT_KEYUP, this.onKeyUp, this);
    
    // Обновляем позицию камеры один раз в начале
    this.updateCamera();
    
    // Отвязываем события при уничтожении скрипта
    this.on('destroy', function() {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.keyboard.off(pc.EVENT_KEYDOWN, this.onKeyDown, this);
        this.app.keyboard.off(pc.EVENT_KEYUP, this.onKeyUp, this);
    });
};

// Обработка нажатия кнопки мыши
FollowCamera2.prototype.onMouseDown = function(event) {
    this.isMouseDown = true;
    this.lastMouseX = event.x;
    this.lastMouseY = event.y;
};

// Обработка отпускания кнопки мыши
FollowCamera2.prototype.onMouseUp = function(event) {
    this.isMouseDown = false;
};

// Обработка движения мыши
FollowCamera2.prototype.onMouseMove = function(event) {
    if (this.isMouseDown && !this.isDragging) {
        const deltaX = event.x - this.lastMouseX;
        const deltaY = event.y - this.lastMouseY;
        
        this.yaw -= deltaX * this.yawSpeed * 0.1;
        this.pitch -= deltaY * this.pitchSpeed * 0.1;
        
        this.pitch = pc.math.clamp(this.pitch, -Math.PI/2, Math.PI/2);
        
        this.lastMouseX = event.x;
        this.lastMouseY = event.y;
    }
};

// Обработка нажатия клавиши
FollowCamera2.prototype.onKeyDown = function(event) {
    this.keys[event.key] = true;
};

// Обработка отпускания клавиши
FollowCamera2.prototype.onKeyUp = function(event) {
    this.keys[event.key] = false;
};

// Обновление углов поворота от клавиатуры
FollowCamera2.prototype.updateFromKeyboard = function(dt) {
    // WASD управление
    if (this.keys[pc.KEY_A]) {
        this.yaw += this.keyboardSpeed * dt;
    } else if (this.keys[pc.KEY_D]) {
        this.yaw -= this.keyboardSpeed * dt;
    }
    
    if (this.keys[pc.KEY_W]) {
        this.pitch += this.keyboardSpeed * dt;
    } else if (this.keys[pc.KEY_S]) {
        this.pitch -= this.keyboardSpeed * dt;
    }
    
    // Ограничиваем наклон камеры
    this.pitch = pc.math.clamp(this.pitch, -Math.PI/2, Math.PI/2);
};

FollowCamera2.prototype.checkEdgeScroll = function(dt) {
    const mouseX = this.app.mouse._lastX;
    const mouseY = this.app.mouse._lastY;
    const width = this.app.graphicsDevice.width;
    const height = this.app.graphicsDevice.height;

    // Поворот вправо при подходе к правому краю
    if (mouseX > width - this.edgeThreshold) {
        this.yaw -= this.edgeSpeed * dt; // Уменьшаем угол yaw
    }
    // Поворот влево при подходе к левому краю
    else if (mouseX < this.edgeThreshold) {
        this.yaw += this.edgeSpeed * dt; // Увеличиваем угол yaw
    }

    // Аналогичная логика для вертикального перемещения
    if (mouseY < this.edgeThreshold) {
        this.pitch += this.edgeSpeed * dt;
    } else if (mouseY > height - this.edgeThreshold) {
        this.pitch -= this.edgeSpeed * dt;
    }

    this.pitch = pc.math.clamp(this.pitch, -Math.PI/2, Math.PI/2);
};

// Обновление позиции камеры
FollowCamera2.prototype.updateCamera = function() {
    // Вычисляем поворот камеры
    const quatX = new pc.Quat();
    quatX.setFromAxisAngle(pc.Vec3.RIGHT, this.pitch);
    
    const quatY = new pc.Quat();
    quatY.setFromAxisAngle(pc.Vec3.UP, this.yaw);
    
    const rotation = new pc.Quat();
    rotation.mul2(quatY, quatX);
    
    // Устанавливаем поворот камеры
    this.entity.setRotation(rotation);
    
    // Позиционируем камеру относительно точки вращения
    const forward = new pc.Vec3();
    rotation.transformVector(pc.Vec3.FORWARD, forward);
    
    const position = new pc.Vec3();
    position.copy(this.pivotPoint);
    position.sub(forward.scale(this.distanceFromTarget));
    
    this.entity.setPosition(position);
};

// Обновление каждый кадр
FollowCamera2.prototype.update = function(dt) {
    this.updateFromKeyboard(dt);
    this.checkEdgeScroll(dt);
    this.updateCamera();
};

// dragAndDrop.js
var DragAndDrop = pc.createScript('dragAndDrop');

DragAndDrop.attributes.add('distanceFromCamera', {
    type: 'number',
    default: 1.2,
    title: 'Дистанция от камеры'
});

DragAndDrop.prototype.initialize = function() {
    this.draggedEntity = null;
    this.camera = this.app.root.findComponents('camera')[0];
    this.cameraEntity = this.camera.entity; 
    this.offset = new pc.Vec3();

    if (!this.camera) {
        console.error("Камера не найдена!");
        return;
    }
    this.collisionRadius = 0.7; // Радиус коллизии объекта
    this.safetyMargin = 0.4; // Отступ от препятствий

    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
};

DragAndDrop.prototype.onMouseDown = function(event) {
    if (event.button !== pc.MOUSEBUTTON_LEFT) return;

    const cursorPos = new pc.Vec3();
    this.camera.screenToWorld(event.x, event.y, 1, cursorPos);

    const from = this.cameraEntity.getPosition().clone();
    const to = new pc.Vec3();
    to.sub2(cursorPos, from).normalize().scale(1000).add(from);

    const result = this.app.systems.rigidbody.raycastFirst(from, to);

    if (result && this.draggbleItems && this.draggbleItems.includes(result.entity.name)) {
        this.draggedEntity = result.entity;
        const rigidbody = this.draggedEntity.rigidbody;
        
        if (rigidbody) {
            // Сохраняем исходное состояние и делаем кинематическим
            this.originalType = rigidbody.type;
            rigidbody.type = pc.BODYTYPE_KINEMATIC;
            rigidbody.ccdEnabled = true;
            rigidbody.ccdSweptSphereRadius = 0.2;
        } else {
            console.warn("Перетаскиваемый объект не имеет RigidBody компонента!");
        }

        const cameraScript = this.cameraEntity.script.followCamera2;
        if (cameraScript) {
            cameraScript.isDragging = true;
        }

        const cameraPos = this.cameraEntity.getPosition();
        const objectPos = this.draggedEntity.getPosition();
        this.dragDistance = cameraPos.distance(objectPos);

        const pickPos = new pc.Vec3();
        this.camera.screenToWorld(event.x, event.y, this.dragDistance, pickPos);
        this.offset.sub2(objectPos, pickPos);
    }
};

DragAndDrop.prototype.calculateScrollPosition = function(event, distance) {
    const pos = new pc.Vec3();
    
    // Правильный вызов screenToWorld:
    this.camera.screenToWorld(
        event.x, 
        event.y, 
        distance, 
        pos, // Целевой вектор
        this.cameraEntity // Явное указание камеры
    );
    
    return pos.add(this.offset);
};

// Модифицируем метод onMouseWheel
DragAndDrop.prototype.onMouseWheel = function(event) {
    if (!this.draggedEntity || !this.draggedEntity.rigidbody) return;

    // Инвертируем направление скролла
    const delta = event.wheel * 0.1;
    const proposedDistance = this.dragDistance + delta;

    // Рассчитываем целевую позицию
    const targetPos = this.calculateScrollPosition(event, proposedDistance);
    
    // Проверяем коллизии
    const collisionResult = this.checkCollisionsAlongPath(
        this.draggedEntity.getPosition(),
        targetPos
    );

    // Обновляем состояние
    if (collisionResult.hasCollision) {
        this.dragDistance = collisionResult.safeDistance;
        this.draggedEntity.rigidbody.teleport(collisionResult.safePosition);
    } else {
        this.dragDistance = Math.max(0.2, Math.min(proposedDistance, 10));
        this.draggedEntity.rigidbody.teleport(targetPos);
    }

    event.event.preventDefault();
};

// Добавляем метод проверки коллизий
DragAndDrop.prototype.checkCollisionsAlongPath = function(from, to) {
    const result = {
        hasCollision: false,
        safeDistance: this.dragDistance,
        safePosition: to.clone(),
        entityName: undefined
    };

    // Вычисляем направление и расстояние
    const direction = new pc.Vec3().sub2(to, from);
    const maxDistance = direction.length();
    direction.normalize();

    // Делаем raycast с учетом размера объекта
    const rayResult = this.app.systems.rigidbody.raycastFirst(
        from,
        to,
        {
            excludeEntities: [this.draggedEntity],
            radius: 0.5 // Радиус для объемного raycast'а
        }
    );

    if (rayResult) {
        result.entityName = rayResult.name;
        result.hasCollision = true;
        result.safePosition = rayResult.point.add(
            rayResult.normal.scale(0.3) // Отступ от поверхности
        );
        result.safeDistance = this.cameraEntity.getPosition().distance(result.safePosition);
    }

    return result;
};

// Многоуровневая проверка коллизий
DragAndDrop.prototype.multiStageCollisionCheck = function(from, to) {
    const result = {
        hasCollision: false,
        safePosition: to.clone(),
        penetration: 0
    };

    // 1. Проверка объёмом
    const overlaps = this.app.systems.rigidbody.overlapCapsule({
        start: from,
        end: to,
        radius: this.collisionRadius,
        excludeEntities: [this.draggedEntity]
    });

    if (overlaps.length > 0) {
        result.hasCollision = true;
        result.safePosition = this.resolvePenetration(overlaps, to);
    }

    // 2. Дополнительная проверка лучом
    if (!result.hasCollision) {
        const rayResult = this.app.systems.rigidbody.raycastFirst(
            from,
            to,
            { excludeEntities: [this.draggedEntity] }
        );
        
        if (rayResult) {
            result.hasCollision = true;
            result.safePosition = rayResult.point
                .add(rayResult.normal.scale(this.safetyMargin));
        }
    }

    return result;
};

// Разрешение проникновений
DragAndDrop.prototype.resolvePenetration = function(overlaps, targetPos) {
    let adjustedPos = targetPos.clone();
    
    overlaps.forEach(collision => {
        const dir = adjustedPos.sub(collision.point).normalize();
        const depth = this.collisionRadius + collision.distance;
        adjustedPos.add(dir.scale(depth + this.safetyMargin));
    });

    return adjustedPos;
};

DragAndDrop.prototype.onMouseMove = function(event) {
    if (!this.draggedEntity) return;
    this.updatePosition(event);
};

// Новая функция для безопасного обновления позиции
DragAndDrop.prototype.updatePosition = function(event) {
    const targetPos = new pc.Vec3();
    this.camera.screenToWorld(event.x, event.y, this.dragDistance, targetPos);
    targetPos.add(this.offset);

    // Проверка коллизий при перемещении
    const safePos = this.adjustPositionForCollisions(targetPos);
    
    if (this.draggedEntity.rigidbody) {
        this.draggedEntity.rigidbody.teleport(safePos);
    } else {
        this.draggedEntity.setPosition(safePos);
    }
};

// Проверка коллизий при изменении расстояния
DragAndDrop.prototype.checkCollisions = function(proposedDistance, event) {
    const from = this.cameraEntity.getPosition();
    const to = new pc.Vec3();
    this.camera.screenToWorld(event.x, event.y, proposedDistance, to);

    // Raycast с исключением текущего объекта
    const result = this.app.systems.rigidbody.raycastFirst(from, to, {
        excludeEntities: [this.draggedEntity]
    });

    return result ? Math.max(0.2, from.distance(result.point) - 0.2) : proposedDistance;
};

// Корректировка позиции с учетом коллизий
DragAndDrop.prototype.adjustPositionForCollisions = function(targetPos) {
    const currentPos = this.draggedEntity.getPosition();
    const direction = new pc.Vec3();
    direction.sub2(targetPos, currentPos).normalize();
    
    // Проверка на всем пути перемещения
    const result = this.app.systems.rigidbody.raycastFirst(
        currentPos,
        targetPos,
        { excludeEntities: [this.draggedEntity] }
    );

    if (result) {
        // Смещение от точки столкновения
        const adjusted = result.point.clone();
        adjusted.addScaled(result.normal, 0.1); // Отступ от поверхности
        return adjusted;
    }
    
    return targetPos;
};

DragAndDrop.prototype.onMouseUp = function(event) {
    if (this.draggedEntity && this.draggedEntity.rigidbody) {
        const rigidbody = this.draggedEntity.rigidbody;
        rigidbody.mass = 10;
        rigidbody.linearDamping = 0.5;
        rigidbody.angularDamping = 0.8;
        rigidbody.restitution = 0.2;
        rigidbody.friction = 0.7;
        
        // Всегда делаем объект динамическим при отпускании
        rigidbody.kinematic = false;
        
        // Явно указываем тип тела
        rigidbody.type = pc.BODYTYPE_DYNAMIC;
        
        // Сброс скорости
        rigidbody.linearVelocity = pc.Vec3.ZERO;
        rigidbody.angularVelocity = pc.Vec3.ZERO;
        
        // Принудительная активация
        rigidbody.activate();
        
        // Синхронизация трансформации
        rigidbody.syncEntityToBody();
    }
    
    this.draggedEntity = null;
    const cameraScript = this.cameraEntity.script.followCamera2;
    if (cameraScript) {
        cameraScript.isDragging = false;
    }
};

DragAndDrop.prototype.dropRubbish = function() {
    const appRoot = this.app.root;
    const trashBox = appRoot.findByName("trashHole");
    const trashItems = [
        appRoot.findByName("trash1"),
        appRoot.findByName("trash2"),
        appRoot.findByName("trash3"),
        appRoot.findByName("trash4"),
        appRoot.findByName("trash5")
    ];

    // Получаем параметры корзины
    const trashBoxPos = trashBox.getPosition();
    const trashBoxCollider = trashBox.collision;
    const boxSize = trashBoxCollider.halfExtents;

    // Проверяем каждый мусорный объект
    trashItems.forEach(trash => {
        if (!trash || trash.destroyed) return;

        const trashPos = trash.getPosition();
        
        // Проверяем попадание в границы корзины
        const isInsideX = Math.abs(trashPos.x - trashBoxPos.x) <= boxSize.x;
        const isInsideY = Math.abs(trashPos.y - trashBoxPos.y) <= boxSize.y;
        const isInsideZ = Math.abs(trashPos.z - trashBoxPos.z) <= boxSize.z;

        if (isInsideX && isInsideY && isInsideZ) {
            // Визуальные эффекты перед удалением
            this.playDisposeEffect(trashPos);
            
            // Удаляем объект
            trash.destroy();
            this.draggbleItems = this.draggbleItems.filter(name => name !== trash.name)
            console.log("Мусор утилизирован:", trash.name);
        }
    });
};

// Вспомогательный метод для эффектов удаления
DragAndDrop.prototype.playDisposeEffect = function(pos) {
    // Создаем эффект частиц
    const effect = new pc.Entity("DisposeEffect");
    effect.addComponent("particlesystem", {
        numParticles: 20,
        lifetime: 1,
        startSize: 0.2,
        endSize: 0.01,
    });
    effect.setPosition(pos);
    this.app.root.addChild(effect);

    // Удаляем эффект через 1 секунду
    setTimeout(() => effect.destroy(), 1000);
};

DragAndDrop.prototype.setItems = function(items) {
    this.draggbleItems = items.map(item => item.name)
};

DragAndDrop.prototype.update = function(dt) {
    this.dropRubbish()
};

// followCursor.js
var FollowCursor = pc.createScript('followCursor');

FollowCursor.attributes.add('distanceFromCamera', {
    type: 'number',
    default: 1.2
});

FollowCursor.prototype.initialize = function() {
    console.log(this.app.root.findComponents('camera'))
    // Находим камеру по имени
    this.camera = this.app.root.findComponents('camera')[0]; // Замените на ваше имя камеры!

    if (!this.camera) {
        console.error("Камера не найдена!");
        return;
    }

    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
};

FollowCursor.prototype.onMouseMove = function(event) {
    if (!this.camera) return;

    // Преобразуем координаты мыши в мировые
    const worldCoord = this.camera.screenToWorld(event.x, event.y, this.distanceFromCamera);
    this.entity.setPosition(worldCoord);
};

// scenePhysics.js
var ScenePhysics = pc.createScript('scenePhysics');

ScenePhysics.prototype.initialize = function() {
    // Настройка гравитации
    this.app.systems.rigidbody.gravity.set(0, -9.8, 0);

    this.app.systems.rigidbody.solverIterations = 50; // Повышение точности

    // Включение непрерывного обнаружения коллизий
    this.app.systems.rigidbody.continuousDetection = true;
    
    // Настройки сна для физических тел
    this.app.systems.rigidbody.linearSleepingThreshold = 10;
    this.app.systems.rigidbody.angularSleepingThreshold = 10;
    
    // Создание земли
    const ground = new pc.Entity('ground');
    ground.addComponent('rigidbody', {
        type: 'static'
    });
    ground.addComponent('collision', {
        type: 'box',
        halfExtents: new pc.Vec3(10, 0.5, 10)
    });
    ground.setPosition(0, -1, 0);
    this.app.root.addChild(ground);
};

// missions.js
var Missions = pc.createScript('missions');

// //интерфейс задания:
// interface Mission {
//     steps: Step[]
//     start?: () => void;
//     end?: () => void;
// }

// //интерфейс шага:
// interface Step {
//     actions: Action[]
//     currentAction: Action
//     start?: () => void;
//     end?: () => void;
// }

// //интерфейс действия:
// interface Action {
//     hintTimeoutId?: number;
//     start: (act: Action) => void;
//     target: Entity;
//     hint: string;
//     next: () => void
//     end: (target?: Entity) => void
//     actionCancelledHandler?: (target?: Entity) => void
// }



// // Модификация initialize для добавления нескольких миссий
// var originalInitialize = Missions.prototype.initialize;
// Missions.prototype.initialize = function() {
//     const appRoot = this.app.root;
//     const camera = appRoot.findComponents('camera')[0].entity;
//     const dndScript = camera.script.dragAndDrop;
//     const hintEntity = appRoot.findByName("hint");
//     this.createAction = ({target, hint, actionHandler, actionCancelledHandler, shouldhideHint, draggbleItems, end}) => {
//         const action = {next: () => {}}

//         const setHintTimeout = () => {
//             action.hintTimeoutId = setTimeout(() => {
//                 if (target.script?.objectHint) {
//                     target.script.objectHint.show();
//                 }
//                 hintEntity?.script?.textChanger?.setText(hint);
//                 this.shouldhideHint = shouldhideHint;
//             }, 5_000)
//         }
//         action.start = () => {
//             console.log("ACTION STARTED")
//             this.shouldhideHint = false
//             if (draggbleItems) {
//                 dndScript.setItems(draggbleItems);
//             }
//             this.actionHandler = actionHandler;
//             this.currentAction = action;
//             setHintTimeout();
//         }
//         action.end = () => {
//             action.hideHint();
//             if (end) {
//                 end()
//             }
//             dndScript.draggedEntity = null
//             dndScript.setItems([])
//             action.next();
//         }

//         action.hideHint = () => {
//             clearTimeout(action.hintTimeoutId);
//             if (target.script?.objectHint) {
//                 target.script.objectHint.hide();
//             }
//             hintEntity?.script?.textChanger?.setText("");
//         }

//         action.actionCancelledHandler = () => {
//             console.log("ACTION CANCELLED")
//             if (actionCancelledHandler) {
//                 actionCancelledHandler(target);
//             }
//         }

//         return action;
//     }

//     this.createStep = ({actions, start, end}) => {
//         const step = {actions, currentAction: actions[0], next: () => {}};
//         step.end = () => {
//             console.log("STEP ENDED");
//             if (end) {
//                 end();
//             }
//             step.next();
//         }
//         step.start = () => {
//             console.log("STEP STARTED");
        
//             actions.forEach((act, i) => {
//                 if (i === actions.length - 1) {
//                     act.next = step.end;
//                 } else {
//                     act.next = actions[i + 1].start;
//                 }
//             })
//             if (start) {
//                 start();
//             }
//             actions[0].start();
//         }

//         return step;
//     }

//     this.createMission = ({steps, start, end}) => {
//         const mission = {steps};
//         mission.end = () => {
//             this.actionHandler = undefined;
//             this.currentAction = undefined;
//             this.shouldhideHint = false;
//             console.log("MISSION PASSED!!!");
//             if (end) {
//                 end();
//             }
//         }
//         mission.start = () => {
//             console.log("MISSION STARTED");
//             steps.forEach((step, i) => {
//                 if (i === steps.length - 1) {
//                     step.next = mission.end;
//                 } else {
//                     step.next = steps[i + 1].start;
//                 }
//             })
//             steps[0].start();
//             if (start) {
//                 start();
//             }
//         }

//         return mission;
//     }

//     // Создаем все миссии
//     this.hangPictureMission = this.setupHangPictureTask();
//     this.lookUnderBooksMission = this.setupLookUnderBooksTask();
//     this.checkComputerMission = this.setupCheckComputerTask();
    
//     // Собираем все миссии в массив для удобства управления
//     this.allMissions = [
//         { id: 'hangPicture', mission: this.hangPictureMission },
//         { id: 'lookUnderBooks', mission: this.lookUnderBooksMission },
//         { id: 'checkComputer', mission: this.checkComputerMission }
//     ];
    
//     // Выбираем миссию для запуска (можно запустить любую)
//     // this.currentMissionId = 'checkComputer'; // Запустим новую миссию
//     // this.currentMission = this.checkComputerMission;
//     // this.currentMission.start();
    
//     // Обработчик на update для проверки выполнения текущего действия
//     this.on('update', function(dt) {
//         if (this.actionHandler && this.currentAction) {
//             if (this.actionHandler()) {
//                 this.currentAction.end();
//             }
//         }
//     });
    
//     // Обработчик для завершения миссий и запуска следующей
//     this.app.on('mission:completed', (missionId) => {
//         console.log(`Миссия ${missionId} завершена!`);     

//     });
    
//     // Обработчик для события завершения викторины
//     this.app.on('quiz:completed', () => {
//         console.log("Викторина завершена!");
//         // Дополнительная логика после завершения викторины, если нужно
//     });
//     this.startMissionSequence(['hangPicture', 'lookUnderBooks', 'checkComputer']);
// };

// // Функция для запуска конкретной миссии
// Missions.prototype.startMission = function(missionId) {
//     // Сначала останавливаем текущую миссию, если она есть
//     if (this.currentMission) {
//         // Можно добавить метод остановки миссии, если нужно
//         this.currentMissionId = null;
//         this.currentMission = null;
//     }
    
//     // Находим миссию по ID
//     const missionData = this.allMissions.find(m => m.id === missionId);
    
//     if (missionData) {
//         this.currentMissionId = missionId;
//         this.currentMission = missionData.mission;
//         this.currentMission.start();
//         return true;
//     }
    
//     console.error(`Миссия с ID ${missionId} не найдена`);
//     return false;
// };

// // Функция для запуска миссий в последовательности
// Missions.prototype.startMissionSequence = function(missionIds) {
//     if (!missionIds || missionIds.length === 0) return;
    
//     this.missionSequence = missionIds;
//     this.currentSequenceIndex = 0;
    
//     // Запускаем первую миссию
//     this.startMission(this.missionSequence[0]);
    
//     // Устанавливаем обработчик для перехода к следующей миссии
//     const sequenceHandler = (completedMissionId) => {
//         const currentMissionId = this.missionSequence[this.currentSequenceIndex];
        
//         if (completedMissionId === currentMissionId) {
//             this.currentSequenceIndex++;
            
//             if (this.currentSequenceIndex < this.missionSequence.length) {
//                 // Запускаем следующую миссию с небольшой задержкой
//                 setTimeout(() => {
//                     this.startMission(this.missionSequence[this.currentSequenceIndex]);
//                 }, 2000);
//             } else {
//                 // Все миссии в последовательности выполнены
//                 console.log("Вся последовательность миссий завершена!");
//                 this.app.off('mission:completed', sequenceHandler);
//             }
//         }
//     };
    
//     // Устанавливаем обработчик единожды
//     this.app.off('mission:completed', sequenceHandler);
//     this.app.on('mission:completed', sequenceHandler);
// };





// // initialize code called once per entity
// Missions.prototype.initialize = function() {
    

//     // const flashDrive = appRoot.findByName("flashDrive");

//     // const firstStepFistAct = createAction({
//     //     hint: "Найдите флешку",
//     //     target: flashDrive,
//     //     actionHandler: () => dndScript.draggedEntity === flashDrive
//     // })

//     // const backPack = appRoot.findByName("backpack");

//     // const firstStepSecondAct = createAction({
//     //     hint: "Положите флешку в рюкзак",
//     //     target: backPack,
//     //     actionHandler: () => dndScript.checkCollisionsAlongPath(flashDrive.getPosition(), backPack.getPosition()).entityName === "backpack",
//     //     actionCancelledHandler: () => {}
//     // })
    

//     // const firstStepActions = [firstStepFistAct, firstStepSecondAct];

//     // const firstStep = createStep({actions: firstStepActions});
//     const appRoot = this.app.root;
//     const camera = appRoot.findComponents('camera')[0].entity;
//     const dndScript = camera.script.dragAndDrop;
//     const hintEntity = appRoot.findByName("hint");
//     this.createAction = ({target, hint, actionHandler, actionCancelledHandler, shouldhideHint, draggbleItems, end}) => {
//         const action = {next: () => {}}

//         const setHintTimeout = () => {
//             action.hintTimeoutId = setTimeout(() => {
//                 if (target.script?.objectHint) {
//                     target.script.objectHint.show();
//                 }
//                 hintEntity?.script?.textChanger?.setText(hint);
//                 this.shouldhideHint = shouldhideHint;
//             }, 5_000)
//         }
//         action.start = () => {
//             console.log("ACTION STARTED")
//             this.shouldhideHint = false
//             if (draggbleItems) {
//                 dndScript.setItems(draggbleItems);
//             }
//             this.actionHandler = actionHandler;
//             this.currentAction = action;
//             setHintTimeout();
//         }
//         action.end = () => {
//             action.hideHint();
//             if (end) {
//                 end()
//             }
//             dndScript.draggedEntity = null
//             dndScript.setItems([])
//             action.next();
//         }

//         action.hideHint = () => {
//             clearTimeout(action.hintTimeoutId);
//             if (target.script?.objectHint) {
//                 target.script.objectHint.hide();
//             }
//             hintEntity?.script?.textChanger?.setText("");
//         }

//         action.actionCancelledHandler = () => {
//             console.log("ACTION CANCELLED")
//             if (actionCancelledHandler) {
//                 actionCancelledHandler(target);
//             }
//         }

//         return action;
//     }

//     this.createStep = ({actions, start, end}) => {
//         const step = {actions, currentAction: actions[0], next: () => {}};
//         step.end = () => {
//             console.log("STEP ENDED");
//             if (end) {
//                 end();
//             }
//             step.next();
//         }
//         step.start = () => {
//             console.log("STEP STARTED");
        
//             actions.forEach((act, i) => {
//                 if (i === actions.length - 1) {
//                     act.next = step.end;
//                 } else {
//                     act.next = actions[i + 1].start;
//                 }
//             })
//             if (start) {
//                 start();
//             }
//             actions[0].start();
//         }

//         return step;
//     }

//     this.createMission = ({steps, start, end}) => {
//         const mission = {steps};
//         mission.end = () => {
//             this.actionHandler = undefined;
//             this.currentAction = undefined;
//             this.shouldhideHint = false;
//             console.log("MISSION PASSED!!!");
//             if (end) {
//                 end();
//             }
//         }
//         mission.start = () => {
//             console.log("MISSION STARTED");
//             steps.forEach((step, i) => {
//                 if (i === steps.length - 1) {
//                     step.next = mission.end;
//                 } else {
//                     step.next = steps[i + 1].start;
//                 }
//             })
//             steps[0].start();
//             if (start) {
//                 start();
//             }
//         }

//         return mission;
//     }

//     const trash1 = appRoot.findByName("trash1")
//     const trash2 = appRoot.findByName("trash2")
//     const trash3 = appRoot.findByName("trash3")
//     const trash4 = appRoot.findByName("trash4")
//     const trash5 = appRoot.findByName("trash5")
//     const draggbleItems = [trash1, trash2, trash3, trash4, trash5]

//     const firstActHandler = () => {
//         return dndScript.draggbleItems?.length === 0
//     }

//     const firstActShouldHideHint = () => {
//         return dndScript.draggbleItems?.length !== 5
//     }

//     const firstStepFirstAct = this.createAction({
//         hint: "Найти мусорку и выбросить мусор",
//         target: appRoot.findByName("trashHole"),
//         actionHandler: firstActHandler,
//         shouldhideHint: firstActShouldHideHint,
//         draggbleItems
//     })

//     const sticker = appRoot.findByName("sticker1")

//     const secActHandler = () => {
//         return dndScript.draggedEntity === sticker
//     }

//     const firstStepSecAction = this.createAction({
//         hint: "Найти записку",
//         target: sticker,
//         actionHandler: secActHandler,
//         shouldhideHint: secActHandler,
//         draggbleItems: [sticker]
//     })

//     const firstStepActions = [firstStepFirstAct, firstStepSecAction];

//     const firstStep = this.createStep({actions: firstStepActions});
    
//     this.mission = this.createMission({steps: [firstStep]});
//     this.mission.start();
// };

// // update code called every frame
// Missions.prototype.update = function(dt) {
//     if (this.shouldhideHint && this.shouldhideHint() && this.currentAction) {
//         this.currentAction.hideHint();
//     }
//     if (this.actionHandler && this.actionHandler() && this.currentAction) {
//         this.currentAction.end();
//     }
// };


// initialize code called once per entity
Missions.prototype.initialize = function() {
    const appRoot = this.app.root;
    const camera = appRoot.findComponents('camera')[0].entity;
    const dndScript = camera.script.dragAndDrop;
    const hintEntity = appRoot.findByName("hint");
    
    this.createAction = ({target, hint, actionHandler, actionCancelledHandler, shouldhideHint, draggbleItems, end}) => {
        const action = {next: () => {}}

        const setHintTimeout = () => {
            action.hintTimeoutId = setTimeout(() => {
                if (target.script?.objectHint) {
                    target.script.objectHint.show();
                }
                hintEntity?.script?.textChanger?.setText(hint);
                this.shouldhideHint = shouldhideHint;
            }, 5_000)
        }
        action.start = () => {
            console.log("ACTION STARTED")
            this.shouldhideHint = false
            if (draggbleItems) {
                dndScript.setItems(draggbleItems);
            }
            this.actionHandler = actionHandler;
            this.currentAction = action;
            setHintTimeout();
        }
        action.end = () => {
            action.hideHint();
            if (end) {
                end()
            }
            dndScript.draggedEntity = null
            dndScript.setItems([])
            action.next();
        }

        action.hideHint = () => {
            clearTimeout(action.hintTimeoutId);
            if (target.script?.objectHint) {
                target.script.objectHint.hide();
            }
            hintEntity?.script?.textChanger?.setText("");
        }

        action.actionCancelledHandler = () => {
            console.log("ACTION CANCELLED")
            if (actionCancelledHandler) {
                actionCancelledHandler(target);
            }
        }

        return action;
    }

    this.createStep = ({actions, start, end, index}) => {
        const step = {actions, currentAction: actions[0], next: () => {}};
        step.end = () => {
            window.gameUtils.openTask(`task${index}`)
            console.log("STEP ENDED");
            if (end) {
                end();
            }
            step.next();
        }
        step.start = () => {
            console.log("STEP STARTED");
        
            actions.forEach((act, i) => {
                if (i === actions.length - 1) {
                    act.next = step.end;
                } else {
                    act.next = actions[i + 1].start;
                }
            })
            if (start) {
                start();
            }
            actions[0].start();
        }

        return step;
    }

    this.createMission = ({steps, start, end}) => {
        const mission = {steps};
        mission.end = () => {
            this.actionHandler = undefined;
            this.currentAction = undefined;
            this.shouldhideHint = false;
            window.gameUtils.end();
            console.log("MISSION PASSED!!!");
            if (end) {
                end();
            }
        }
        mission.start = () => {
            console.log("MISSION STARTED");
            steps.forEach((step, i) => {
                if (i === steps.length - 1) {
                    step.next = mission.end;
                } else {
                    step.next = steps[i + 1].start;
                }
            })
            steps[0].start();
            if (start) {
                start();
            }
        }

        return mission;
    }

    
    // Создаем остальные миссии
    // this.hangPictureMission = this.setupHangPictureTask();
    // this.lookUnderBooksMission = this.setupLookUnderBooksTask();
    // this.checkComputerMission = this.setupCheckComputerTask();

    const firstMission = this.createMission({
        steps: [this.setupTrashStep(), this.setupHangPictureStep(), this.setupLookUnderBooksStep(), this.setupLastStep()],
        start: () => {
            console.log("Миссия 1 началась");
        },
        end: () => {
            console.log("Миссия 1 завершена");
            this.app.fire('mission:completed', '1');
        }
    });
    
    
    // // Собираем все миссии в массив для управления
    // this.a = [
    //     { id: 'trash', mission: this.trashMission },
    //     { id: 'hangPicture', mission: this.hangPictureMission },
    //     { id: 'lookUnderBooks', mission: this.lookUnderBooksMission },
    //     { id: 'checkComputer', mission: this.checkComputerMission }
    // ];
    
    // Запускаем последовательность миссий
    this.startMission(firstMission);
};



Missions.prototype.setupTrashStep = function() {
    const appRoot = this.app.root;
    const camera = appRoot.findComponents('camera')[0].entity;
    const dndScript = camera.script.dragAndDrop;

    const trash1 = appRoot.findByName("trash1")
    const trash2 = appRoot.findByName("trash2")
    const trash3 = appRoot.findByName("trash3")
    const trash4 = appRoot.findByName("trash4")
    const trash5 = appRoot.findByName("trash5")
    const draggbleItems = [trash1, trash2, trash3, trash4, trash5]

    const firstActHandler = () => {
        return dndScript.draggbleItems?.length === 0
    }

    const firstActShouldHideHint = () => {
        return dndScript.draggbleItems?.length !== 5
    }

    const firstStepFirstAct = this.createAction({
        hint: "Проверить нет ли флешки в горе мусора",
        target: appRoot.findByName("trashHole"),
        actionHandler: firstActHandler,
        shouldhideHint: firstActShouldHideHint,
        draggbleItems
    })

    const sticker = appRoot.findByName("sticker1")

    const secActHandler = () => {
        return dndScript.draggedEntity === sticker
    }

    const firstStepSecAction = this.createAction({
        hint: "Прочитать записку",
        target: sticker,
        actionHandler: secActHandler,
        shouldhideHint: secActHandler,
        draggbleItems: [sticker]
    })

    const firstStepActions = [firstStepFirstAct, firstStepSecAction];
    return this.createStep({actions: firstStepActions, index: 1});
};

Missions.prototype.setupLastStep = function() {
    const appRoot = this.app.root;
    const camera = appRoot.findComponents('camera')[0].entity;
    const dndScript = camera.script.dragAndDrop;

    const shoes = appRoot.findByName("Shoes")

    const firstActHandler = () => {
        return dndScript.draggedEntity === shoes
    }

    const kickShoes = () => {
        const rb = shoes.rigidbody;
    
        if (rb) {
            rb.type = pc.BODYTYPE_DYNAMIC;
            rb.mass = 1;
            rb.restitution = 0.2; // Небольшая упругость
            rb.friction = 0.5;
            
            if (!rb.enabled) {
                rb.enabled = true;
            }
             // Задаем направление и силу "пинка"
            const direction = new pc.Vec3(1, 5, 5); // Направление (x, y, z)
            direction.normalize(); // Нормализуем вектор
        
            const force = 25; // Сила пинка
        
            // Применяем импульс (учитывает массу объекта)
            rb.applyImpulse(direction.scale(force));
        
            // ИЛИ можно сразу задать скорость (игнорирует массу)
            // rb.linearVelocity = direction.scale(force);
        }
    }

    const firstAct = this.createAction({
        hint: "Флешки нигде нет, Пнуть ботинки",
        target: shoes,
        actionHandler: firstActHandler,
        shouldhideHint: firstActHandler,
        draggbleItems: [shoes],
        end: kickShoes
    })

    const flashDrive = appRoot.findByName("flashDrive")

    const secActHandler = () => {
        return dndScript.draggedEntity === flashDrive
    }

    const secActHideHintHandler = () => {
        return dndScript.draggedEntity === flashDrive
    }

    const secAction = this.createAction({
        hint: "Положить флешку в рюкзак",
        target: flashDrive,
        actionHandler: secActHandler,
        shouldhideHint: secActHideHintHandler,
        draggbleItems: [flashDrive]
    })

    const firstStepActions = [firstAct, secAction];
    return this.createStep({actions: firstStepActions, index: 4});
};

// Функция для запуска конкретной миссии
Missions.prototype.startMission = function(mission) {
    if (mission) {
        this.currentMission = mission;
        this.currentMission.start();
        return true;
    }
    
    console.error(`Ошибка при запуске миссии`);
    return false;
};

// // Функция для запуска миссий в последовательности
// Missions.prototype.startMissionSequence = function(missionIds) {
//     if (!missionIds || missionIds.length === 0) return;
    
//     this.missionSequence = missionIds;
//     this.currentSequenceIndex = 0;
    
//     // Запускаем первую миссию
//     this.startMission(this.missionSequence[0]);
    
//     // Устанавливаем обработчик для перехода к следующей миссии
//     const sequenceHandler = (completedMissionId) => {
//         const currentMissionId = this.missionSequence[this.currentSequenceIndex];
        
//         if (completedMissionId === currentMissionId) {
//             this.currentSequenceIndex++;
            
//             if (this.currentSequenceIndex < this.missionSequence.length) {
//                 // Запускаем следующую миссию с небольшой задержкой
//                 setTimeout(() => {
//                     this.startMission(this.missionSequence[this.currentSequenceIndex]);
//                 }, 2000);
//             } else {
//                 // Все миссии в последовательности выполнены
//                 console.log("Вся последовательность миссий завершена!");
//                 this.app.off('mission:completed', sequenceHandler);
//             }
//         }
//     };
    
//     // Устанавливаем обработчик единожды
//     this.app.off('mission:completed', sequenceHandler);
//     this.app.on('mission:completed', sequenceHandler);
// };

// update code called every frame
Missions.prototype.update = function(dt) {
    if (this.shouldhideHint && this.shouldhideHint() && this.currentAction) {
        this.currentAction.hideHint();
    }
    if (this.actionHandler && this.actionHandler() && this.currentAction) {
        this.currentAction.end();
    }
};






//Шаг "Повесить картину"
Missions.prototype.setupHangPictureStep = function () {
    const appRoot = this.app.root;
    const camera = appRoot.findComponents('camera')[0].entity;
    const dndScript = camera.script.dragAndDrop;

    // Находим все необходимые объекты для миссии
    const painting = appRoot.findByName("painting");
    const shelf = appRoot.findByName("shelf");

    // Функция для создания подсветки места на полке
    this.createShelfHighlight = (shelfEntity) => {
        const highlightEntity = new pc.Entity('shelf_highlight');
        
        // Добавляем компонент модели для подсветки
        highlightEntity.addComponent('model', {
            type: 'box'
        });
        
        // Настраиваем размер и позицию подсветки
        const shelfPos = shelfEntity.getPosition().clone();
        shelfPos.y += 0.3; // Поднимаем над полкой
        highlightEntity.setPosition(shelfPos);
        highlightEntity.setLocalScale(1.2, 0.1, 0.8); // Размер подсветки
        
        // Создаем светящийся материал
        const material = new pc.StandardMaterial();
        material.emissive = new pc.Color(0, 1, 0); // Зеленый свет
        material.opacity = 0.3;
        material.blendType = pc.BLEND_NORMAL;
        material.update();
        
        highlightEntity.model.material = material;
        
        // Добавляем на сцену
        appRoot.addChild(highlightEntity);
        
        // Анимация пульсации
        let time = 0;
        const pulseAnimation = () => {
            time += 0.05;
            const alpha = 0.2 + Math.sin(time) * 0.1;
            material.opacity = alpha;
            material.update();
        };
        
        // Запускаем анимацию
        const pulseInterval = setInterval(pulseAnimation, 50);
        
        // Убираем подсветку через 5 секунд
        setTimeout(() => {
            clearInterval(pulseInterval);
            highlightEntity.destroy();
        }, 5000);
    };

    //Шаг 1 найти картину
    const findPaintingAction = this.createAction({
        hint: "Почему картина стоит на полу?",
        target: painting,
        actionHandler: () => dndScript.draggedEntity === painting,
        draggbleItems: [painting]
    });

    //Шаг 2 повесить картину на полку
    const placePaintingAction = this.createAction({
        hint: "Поместить картину на верхнюю полку.",
        target: shelf,
        actionHandler: () => {
            // Проверяем коллизию между картиной и полкой
            const paintingPos = painting.getPosition();
            const shelfPos = shelf.getPosition();
            const distance = paintingPos.distance(shelfPos);
            
            // Если картина достаточно близко к полке
            return distance < 0.35; // Настрой это расстояние под свою сцену
        },
        shouldhideHint: () => {
            // Показываем подсветку когда картина близко к полке
            const paintingPos = painting.getPosition();
            const shelfPos = shelf.getPosition();
            const distance = paintingPos.distance(shelfPos);
            
            if (distance < 3.0 && !this.shelfHighlightActive) {
                this.createShelfHighlight(shelf);
                this.shelfHighlightActive = true;
            }
            
            return distance < 1.0; // Скрываем подсказку когда близко
        },
        draggbleItems: [painting],
        end: () => {
            // Фиксируем картину на полке
            const shelfPos = shelf.getPosition().clone();
            
            // Настрой позицию картины относительно полки
            shelfPos.y += 0.3; // Поднимаем картину над полкой
            shelfPos.x += -0.03; // Сдвиг по X если нужно
            shelfPos.z += -0.05; // Небольшой сдвиг от стены
            
            painting.setPosition(shelfPos);
            
            // Отключаем физику у картины чтобы она не падала
            const rigidbody = painting.rigidbody;
            if (rigidbody) {
                rigidbody.type = pc.BODYTYPE_KINEMATIC;
                rigidbody.linearVelocity = pc.Vec3.ZERO;
                rigidbody.angularVelocity = pc.Vec3.ZERO;
            }
            
            // Убираем картину из списка перетаскиваемых объектов
            const index = dndScript.draggbleItems?.indexOf(painting);
            if (index !== -1) {
                dndScript.draggbleItems.splice(index, 1);
            }
            
            // Сбрасываем флаг подсветки
            this.shelfHighlightActive = false;
            
            // Изменяем материал картины
            const model = painting.findComponent('model');
            if (model) {
                const materialAsset = this.app.assets.find('painting_material_hint');
                if (materialAsset) {
                    model.material = materialAsset.resource;
                }
            }
            
            console.log("Картина успешно размещена на полке!");
        }
    });

    const sticker = appRoot.findByName("sticker2")

    const readStickerHandler = () => {
        return dndScript.draggedEntity === sticker
    }

    const readSticker = this.createAction({
        hint: "Прочитать записку",
        target: sticker,
        actionHandler: readStickerHandler,
        shouldhideHint: readStickerHandler,
        draggbleItems: [sticker]
    })

    return this.createStep({
        actions: [findPaintingAction, placePaintingAction, readSticker],
        index: 2,
    });;
};

// Шаг "Посмотреть под книгами"
Missions.prototype.setupLookUnderBooksStep = function() {
    const appRoot = this.app.root;
    const camera = appRoot.findComponents('camera')[0].entity;
    const dndScript = camera.script.dragAndDrop;
    
    const bookNames = ["book1", "book2", "book3", "book4", "book5"];
    const books = bookNames.map(name => appRoot.findByName(name)).filter(book => book !== null);
    
    console.log(`Найдено ${books.length} книг для миссии:`, books.map(b => b.name));

    books.forEach((book, index) => {
        console.log(`Настройка книги ${book.name}:`);
        
        // Настраиваем rigidbody
        if (book.rigidbody) {
            book.rigidbody.type = pc.BODYTYPE_DYNAMIC;
            book.rigidbody.mass = 1;
            book.rigidbody.restitution = 0.2; // Небольшая упругость
            book.rigidbody.friction = 0.5;
            
            if (!book.rigidbody.enabled) {
                book.rigidbody.enabled = true;
            }
            console.log(`  - Rigidbody: OK (type: ${book.rigidbody.type}, mass: ${book.rigidbody.mass})`);
        } else {
            console.warn(`  - ВНИМАНИЕ: Книга ${book.name} не имеет rigidbody компонента!`);
        }
        
        // Проверяем collision
        if (book.collision) {
            console.log(`  - Collision: OK`);
        } else {
            console.warn(`  - ВНИМАНИЕ: Книга ${book.name} не имеет collision компонента!`);
        }
    });
    
    const sticker = appRoot.findByName("sticker3")

    const firstActHandler = () => {
        return dndScript.draggedEntity === sticker
    }

    const firstAction = this.createAction({
        hint: "Проверить нет ли флешки за книгами напротив двери",
        target: sticker,
        actionHandler: firstActHandler,
        shouldhideHint: firstActHandler,
        draggbleItems: [sticker, ...books]
    })

    const actions = [firstAction];
    return this.createStep({actions: actions, index: 3});
};




// Миссия "Посмотреть в компьютере"
Missions.prototype.setupCheckComputerTask = function() {
    const appRoot = this.app.root;
    const camera = appRoot.findComponents('camera')[0].entity;
    const dndScript = camera.script.dragAndDrop;
    
    // Находим все необходимые объекты для миссии
    const computer = appRoot.findByName("computer");
    const powerButton = appRoot.findByName("PCBoxPower");
    const monitor = appRoot.findByName("PCMonitor");
    
    // Шаг 1: Найти компьютер
    const findComputerAction = this.createAction({
        hint: "Найдите компьютер. Он находится в противоположном углу от входной двери.",
        target: computer,
        actionHandler: () => {
            // Проверяем, близко ли игрок к компьютеру
            const playerPosition = camera.getPosition();
            const computerPosition = computer.getPosition();
            
            const distance = playerPosition.distance(computerPosition);
            return distance < 3; // Примерное расстояние для обнаружения (подстройте под вашу игру)
        }
    });
    
    // Шаг 2: Найти кнопку включения компьютера
    const findPowerButtonAction = this.createAction({
        hint: "Найдите кнопку включения компьютера. Она выделена желтым цветом.",
        target: powerButton,
        actionHandler: () => {
            // Проверяем, смотрит ли игрок на кнопку включения
            const cameraForward = camera.forward;
            const dirToPowerButton = new pc.Vec3()
                .sub2(powerButton.getPosition(), camera.getPosition())
                .normalize();
            
            const dotProduct = cameraForward.dot(dirToPowerButton);
            const playerPosition = camera.getPosition();
            const powerButtonPosition = powerButton.getPosition();
            const distance = playerPosition.distance(powerButtonPosition);
            
            // Игрок близко к кнопке и смотрит на неё
            return distance < 2 && dotProduct > 0.8;
        }
    });
    
    // Шаг 3: Нажать на кнопку
    const pressPowerButtonAction = this.createAction({
        hint: "Нажмите на кнопку включения компьютера.",
        target: powerButton,
        actionHandler: () => {
            // Проверяем, кликнул ли игрок на кнопку
            const isClicked = dndScript.draggedEntity === powerButton || 
                             (dndScript.lastClickedEntity && dndScript.lastClickedEntity.name === powerButton.name);
            
            if (isClicked) {
                // Меняем модель монитора при нажатии на кнопку
                if (monitor && monitor.model) {
                    // 1) Меняем Asset модели
                    const monitorAsset = this.app.assets.find('Object_74.001');
                    if (monitorAsset) {
                        monitor.model.asset = monitorAsset.id;
                    }
                    
                    // 2) Меняем материал
                    const pcMaterial = this.app.assets.find('pc_material');
                    if (pcMaterial) {
                        // В зависимости от того, как устроена ваша модель, может потребоваться один из этих вариантов:
                        monitor.model.material = pcMaterial.resource;
                        // Или, если у модели есть meshInstances:
                        if (monitor.model.meshInstances && monitor.model.meshInstances.length > 0) {
                            for (let i = 0; i < monitor.model.meshInstances.length; i++) {
                                monitor.model.meshInstances[i].material = pcMaterial.resource;
                            }
                        }
                    }
                }
                return true;
            }
            
            return false;
        }
    });
    
    // Шаг 4: Кликнуть на монитор
    const clickMonitorAction = this.createAction({
        hint: "Кликните на монитор, чтобы взаимодействовать с ним.",
        target: monitor,
        actionHandler: () => {
            // Проверяем, кликнул ли игрок на монитор
            return dndScript.draggedEntity === monitor || 
                  (dndScript.lastClickedEntity && dndScript.lastClickedEntity.name === monitor.name);
        }
    });
    
    // Шаг 5: Подать сигнал для викторины
    const signalForQuizAction = this.createAction({
        hint: "Подайте сигнал для получения викторины.",
        target: monitor,
        actionHandler: () => {
            // Отправляем событие, что нужно показать викторину
            this.app.fire('quiz:show');
            return true; // Действие выполнено успешно
        },
        end: () => {
            // После завершения викторины меняем материал монитора на материал с подсказкой
            this.app.once('quiz:completed', () => {
                if (monitor && monitor.model) {
                    const pcMaterialHint = this.app.assets.find('pc_material_hint');
                    if (pcMaterialHint) {
                        // В зависимости от того, как устроена ваша модель, может потребоваться один из этих вариантов:
                        monitor.model.material = pcMaterialHint.resource;
                        
                        // Или, если у модели есть meshInstances:
                        if (monitor.model.meshInstances && monitor.model.meshInstances.length > 0) {
                            for (let i = 0; i < monitor.model.meshInstances.length; i++) {
                                monitor.model.meshInstances[i].material = pcMaterialHint.resource;
                            }
                        }
                    }
                }
            });
        }
    });
    
    // Шаг 6: Прочитать что написано на мониторе
    const readMonitorAction = this.createAction({
        hint: "Подойдите ближе и прочитайте, что написано на мониторе. Там должна быть подсказка для нахождения следующего задания.",
        target: monitor,
        actionHandler: () => {
            // Проверяем, смотрит ли игрок на монитор и достаточно ли близко находится
            const cameraForward = camera.forward;
            const dirToMonitor = new pc.Vec3()
                .sub2(monitor.getPosition(), camera.getPosition())
                .normalize();
            
            const dotProduct = cameraForward.dot(dirToMonitor);
            const playerPosition = camera.getPosition();
            const monitorPosition = monitor.getPosition();
            const distance = playerPosition.distance(monitorPosition);
            
            // Игрок близко к монитору и смотрит на него под хорошим углом
            return distance < 1.5 && dotProduct > 0.9;
        }
    });
    
    // Создаем шаги миссии
    const findComputerStep = this.createStep({
        actions: [findComputerAction],
        start: () => {
            console.log("Шаг 1: Найти компьютер - начат");
        },
        end: () => {
            console.log("Шаг 1: Найти компьютер - завершен");
        }
    });
    
    const findPowerButtonStep = this.createStep({
        actions: [findPowerButtonAction],
        start: () => {
            console.log("Шаг 2: Найти кнопку включения - начат");
        },
        end: () => {
            console.log("Шаг 2: Найти кнопку включения - завершен");
        }
    });
    
    const pressPowerButtonStep = this.createStep({
        actions: [pressPowerButtonAction],
        start: () => {
            console.log("Шаг 3: Нажать на кнопку - начат");
        },
        end: () => {
            console.log("Шаг 3: Нажать на кнопку - завершен");
        }
    });
    
    const clickMonitorStep = this.createStep({
        actions: [clickMonitorAction],
        start: () => {
            console.log("Шаг 4: Кликнуть на монитор - начат");
        },
        end: () => {
            console.log("Шаг 4: Кликнуть на монитор - завершен");
        }
    });
    
    const signalForQuizStep = this.createStep({
        actions: [signalForQuizAction],
        start: () => {
            console.log("Шаг 5: Подать сигнал для викторины - начат");
        },
        end: () => {
            console.log("Шаг 5: Подать сигнал для викторины - завершен");
        }
    });
    
    const readMonitorStep = this.createStep({
        actions: [readMonitorAction],
        start: () => {
            console.log("Шаг 6: Прочитать подсказку на мониторе - начат");
        },
        end: () => {
            console.log("Шаг 6: Прочитать подсказку на мониторе - завершен");
        }
    });
    
    // Создаем миссию, объединяя все шаги
    const checkComputerMission = this.createMission({
        steps: [findComputerStep, findPowerButtonStep, pressPowerButtonStep, clickMonitorStep, signalForQuizStep, readMonitorStep],
        start: () => {
            console.log("Миссия 'Посмотреть в компьютере' началась");
            
            // Инициализация начального состояния компьютера, если нужно
            if (monitor && monitor.model) {
                // Убедимся, что монитор выключен в начале миссии
                const initialMonitorAsset = this.app.assets.find('mesh_74');
                if (initialMonitorAsset) {
                    monitor.model.asset = initialMonitorAsset.id;
                }
                
                // Устанавливаем начальный материал
                const initialMaterial = this.app.assets.find('PCMonitor');
                if (initialMaterial) {
                    monitor.model.material = initialMaterial.resource;
                }
            }
        },
        end: () => {
            console.log("Миссия 'Посмотреть в компьютере' завершена");
            this.app.fire('mission:completed', 'checkComputer');
        }
    });
    
    return checkComputerMission;
};

// objectHint.js
var ObjectHint = pc.createScript('objectHint');

ObjectHint.attributes.add('offsetY', {
    type: 'number',
    default: 2,
    title: 'Vertical Offset'
});

ObjectHint.attributes.add('pulseSpeed', {
    type: 'number',
    default: 3,
    title: 'Pulse Speed'
});

ObjectHint.attributes.add('minScale', {
    type: 'number',
    default: 0.02,
    title: 'Min Scale'
});

ObjectHint.attributes.add('maxScale', {
    type: 'number',
    default: 0.06,
    title: 'Max Scale'
});

ObjectHint.attributes.add('color', {
    type: 'rgba',
    default: [1, 0, 0, 1],
    title: 'Hint Color'
});

ObjectHint.prototype.initialize = function() {
    // Создаем пульсирующую точку как отдельную сущность
    this.hintEntity = new pc.Entity('PulseHint');
    
    // Добавляем компоненты
    this.hintEntity.addComponent('model', {
        type: 'sphere'
    });
    
    // Настраиваем материал
    this.material = new pc.StandardMaterial();
    this.material.diffuse = this.color;
    this.material.emissive = this.color;
    this.material.update();
    
    this.hintEntity.model.model.meshInstances[0].material = this.material;
    
    // Добавляем в корень сцены
    this.app.root.addChild(this.hintEntity);
    this.hintEntity.enabled = false;

    this.pulseTime = 0;
};

ObjectHint.prototype.update = function(dt) {
    if (!this.hintEntity.enabled) return;

    // Получаем мировую позицию объекта
    const worldPos = this.entity.getPosition();
    
    // Устанавливаем позицию подсказки
    this.hintEntity.setPosition(
        worldPos.x,
        worldPos.y + 0.15,
        worldPos.z
    );

    // Пульсация
    this.pulseTime += dt * this.pulseSpeed;
    const scale = this.minScale + 
        (Math.sin(this.pulseTime) + 1) * 0.5 * 
        (this.maxScale - this.minScale);
    
    this.hintEntity.setLocalScale(scale, scale, scale);

    // Поворот к камере
    if (this.app.camera) {
        this.hintEntity.lookAt(this.app.camera.getPosition());
    }
};

ObjectHint.prototype.show = function() {
    this.hintEntity.enabled = true;
    // Первая синхронизация позиции
    const pos = this.entity.getPosition();
    this.hintEntity.setPosition(pos.x, pos.y + this.offsetY, pos.z);
};

ObjectHint.prototype.hide = function() {
    this.hintEntity.enabled = false;
};

ObjectHint.prototype.onDestroy = function() {
    if (this.hintEntity && !this.hintEntity.destroyed) {
        this.hintEntity.destroy();
    }
};


// textChanger.js
var TextChanger = pc.createScript('textChanger');

TextChanger.prototype.initialize = function() {
    // Получаем компонент элемента
    this.textElement = this.entity.element;
    
    // Валидация
    if (!this.textElement) {
        console.error('Нет компонента element на сущности', this.entity.name);
        return;
    }
    
    if (this.textElement.type !== pc.ELEMENTTYPE_TEXT) {
        console.error('Элемент не является текстовым', this.entity.name);
    }
};

TextChanger.prototype.setText = function(newText) {
    if (this.textElement) {
        this.textElement.text = newText;
    }
};

