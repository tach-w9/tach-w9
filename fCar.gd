extends VehicleBody3D

@onready var CENTER_POINT: Node3D = $center_point 
@onready var CENTER_POINT2: Node3D = $center_point/center_point2 
@onready var IN_CENTER_POINT: Node3D = $in_center_point
@onready var IN_CENTER_POINT2: Node3D = $in_center_point/in_center_point2
@onready var spot_l:SpotLight3D = $spot_l
@onready var spot_r: SpotLight3D = $spot_r
@onready var out_front_cam: Camera3D = $center_point/center_point2/out_cam_f
@onready var out_rear_cam:Camera3D = $center_point/center_point2/out_cam_r


var sensitivity = 0.2

var steer:float = 0.0
@export var MAX_STEER = 0.9


@export var MAX_TORQUE = 500

@export var MAX_RPM = 500




var ff = 1
var screen = false
func _input(event: InputEvent) -> void:
	if event is InputEventScreenDrag:
		CENTER_POINT.rotate_y(-deg_to_rad(event.relative.x)*sensitivity)
		CENTER_POINT2.rotate_x(deg_to_rad(event.relative.y)*sensitivity)
		CENTER_POINT2.rotation.x = clamp(CENTER_POINT2.rotation.x,deg_to_rad(-33),deg_to_rad(33))
func _ready():
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

func _physics_process(delta: float) -> void:
	steer = lerp(steer,Input.get_axis("ui_right","ui_left")*MAX_STEER,delta*5.0)
	steering = steer 
	var acceleration = Input.get_axis("ui_down", "ui_up")
	var rpm = abs($Rear_L.get_rpm())
	$Rear_L.engine_force=move_toward($Rear_L.engine_force,acceleration*MAX_TORQUE*(1-rpm/MAX_RPM),500*delta)
	rpm = abs($Rear_R.get_rpm())
	$Rear_R.engine_force=move_toward($Rear_R.engine_force,acceleration*MAX_TORQUE*(1-rpm/MAX_RPM),500*delta)
	CENTER_POINT.global_position = lerp(CENTER_POINT.global_position,global_position,delta*20)
	if $Rear_L.engine_force < 0 and $Rear_R.engine_force < 0:
		out_rear_cam.current = true
	elif $Rear_L.engine_force > 0 and $Rear_R.engine_force > 0: 
		out_front_cam.current = true
	else:
		out_front_cam.current = true
	CENTER_POINT.transform = CENTER_POINT.transform.interpolate_with(transform,delta*3)
	CENTER_POINT2.rotation = lerp(CENTER_POINT2.rotation,Vector3.ZERO,delta*3)

	
	if Input.is_action_pressed("ui_accept"):
		brake = 500
		engine_force = 0
		spot(true,50)
	else:
		brake=0
	if Input.is_action_just_released("ui_accept"):
		brake = 0
	if acceleration:
		var kk:bool = (acceleration<0)
		
		spot(kk,1)
		
func spot(n,r):
	spot_r.visible=n
	spot_l.visible=n
	spot_r.light_energy=r
	spot_l.light_energy=r
