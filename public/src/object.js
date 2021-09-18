import { TILE_SIZE } from "./world.js";

// any renderable on the stage, wether its UI or a player
export class StageObject
{
    constructor(name)
    {
        this.name = name;                // name of this object
        this.gamePosition = {x:0, y:0};  // position ingame (if it has one)
        this.children = [];              // array of StageObjects
        this.parent = null;              // StageObject parent
        this.keepScale = false;          // should this object keep its scale upon zooming

        this.graphic = null;

        this.interactable = false;       // can we interact with this object as a user
        this.wasHovered = false;         // was cursor on this object
        this.createOverlay = false;      // create overlay on this object upon cursor entering this object
        this.selectable = false;         // can we select this object
        this.position = {}

        this.position = {x:0, y:0};      // position of this object
       // this.scale = {x:1, y:1}          // scale of this object
    }

    // relative to parent
    // so if parent sits at 3200 3200, and this sits at 3205 3205
    // then this returns 5, 5
    getLocalGamePosition() 
    {
        if(parent == null)
            return {x: 0, y:0};

        return {x:this.gamePosition.x - this.parent.gamePosition.x, y:this.gamePosition.y - this.parent.gamePosition.y}
    }

    setParent(parent)
    {
        parent.addChild(this);
    }

    addChild(child)
    {
        if(this.children.indexOf(child) > -1)
            return;

        

        child.parent = this;
        this.children.push(child);
    }
    
    removeChild(child)
    {
        var index = entities.indexOf(child);
        if(index > -1)
        {
            children[i].parent = null;
            this.children.splice(index, 1);
        }
    }

    onClick()
    {

    }

    onZoom(x, y)
    {
        if(this.keepScale)
        {
            this.graphic.scale.x = (1 / x);
            this.graphic.scale.y = (this.graphic.scale.y > 0?(1 / y):(-1 / y));
        }
    }

    isVisible()
    {
        return this.graphic != null && this.graphic.visible;
    }

    setVisibility(value)
    {
        for(var i = 0; i < this.children.length; i++)
            this.children[i].setVisibility(value);

        if(this.graphic != null)
            this.graphic.visible = value;
    }

    setAnchor(x, y)
    {
        for(var i = 0; i < this.children.length; i++)
            this.children[i].setAnchor(x, y);

        if(this.graphic != null && this.graphic.anchor != null)
            this.graphic.anchor.set(x, y);
    }

    // automatically calculates bounds of an object, including all its children
    getInteractableRect()
    {
        var pos = this.getWorldPosition();
        var bl = this.getBottomLeft(pos);

        var pos2 = {};
        pos2.x = this.getWorldPosition().x;
        pos2.y = this.getWorldPosition().y;
        
        var zoom = this.keepScale?1/CAMERA.zoom.x:1.0;

        pos2.x += this.getWorldBounds().width;
        pos2.y += this.getWorldBounds().height;

        var tr = this.getTopRight(pos2);

        return new PIXI.Rectangle(bl.x, bl.y, tr.x - bl.x, tr.y - bl.y)
    }

    getRootParent()
    {
        var parent = this;
        while(parent.parent != null)
            parent = parent.parent;

        return parent;
    }

    getBottomLeft(checkAgainstBL)
    {
        var bottomLeft = checkAgainstBL;

        // make easy copy
        var ret = {};
        ret.x = bottomLeft.x;
        ret.y = bottomLeft.y;

        for(var i = 0; i < this.children.length; i++)
        {
            // ignore children that are not interactable
            if(!this.children[i].interactable)
                continue;

            if(this.children[i].getWorldPosition().x < ret.x)
                ret.x = this.children[i].getWorldPosition().x;

            if(this.children[i].getWorldPosition().y < ret.y)
                ret.y = this.children[i].getWorldPosition().y;
        }

        // keep looking deep for interactable children
        for(var i = 0; i < this.children.length; i++)
            ret = this.children[i].getBottomLeft(ret);

        return ret;
    }

    getTopRight(checkAgainstTR)
    {
        var topRight = checkAgainstTR;

        // make easy copy
        var ret = {};
        ret.x = topRight.x;
        ret.y = topRight.y;

        for(var i = 0; i < this.children.length; i++)
        {
            // ignore children that are not interactable
            if(!this.children[i].interactable)
                continue;
                
            if(this.children[i].getWorldPosition().x + this.children[i].getWorldBounds().width > ret.x)
                ret.x = this.children[i].getWorldPosition().x + this.children[i].getWorldBounds().width;

            if(this.children[i].getWorldPosition().y + this.children[i].getWorldBounds().height > ret.y) // y is inverted, <=
                ret.y = this.children[i].getWorldPosition().y + this.children[i].getWorldBounds().height;
        }

        for(var i = 0; i < this.children.length; i++)
            ret = this.children[i].getTopRight(ret);

        return ret;
    }

    setGraphic(graphic)
    {
        this.graphic = graphic;
        this.graphic.position.x = this.position.x;
        this.graphic.position.y = this.position.y;
    }

    setWorldPosition(x, y)
    {
        var diff = this.getWorldPosition()
        diff.x = x - diff.x;
        diff.y = y - diff.y;

        for(var i = 0; i < this.children.length; i++)
            this.children[i].setWorldPosition(this.children[i].getWorldPosition().x + diff.x, this.children[i].getWorldPosition().y + diff.y);

        this.position.x = x;
        this.position.y = y;

        if(this.graphic == null)
            return;

        this.graphic.position.x = x;
        this.graphic.position.y = y;
    }

    getWorldPosition() 
    {
        return {x:this.position.x, y:this.position.y};
    }

    setTilePosition(x, y)
    {
        var translation = {x:x*TILE_SIZE, y:y * TILE_SIZE}
        this.setWorldPosition(translation.x, translation.y);
    }

    // gets osrs tile coordinates (inverts Y)
    getTilePosition()
    {
        var pos = this.getWorldPosition();
        return {x:pos.x / TILE_SIZE, y:pos.y / TILE_SIZE}
    }

    // bounds on screen, position and width/height
    getScreenBounds()
    {
        return this.graphic.getBounds();
    }

    getWorldBounds()
    {
        var localBounds = this.getScreenBounds();
        var worldBounds = {};
        
        var newPos = CAMERA.screenToWorldPos(localBounds.x, localBounds.y);
        worldBounds.x = newPos.x;
        worldBounds.y = newPos.y;
        worldBounds.width = localBounds.width * (1 / CAMERA.zoom.x);
        worldBounds.height = localBounds.height * (1 / CAMERA.zoom.y);

        return worldBounds;
    }

    setZIndex(val)
    {
        this.graphic.zIndex = val;
    }

    onAssetsLoaded()
    {

    }
}

// object in the world
export class WorldObject extends StageObject
{
    constructor(name)
    {
        super(name);


    } 
}

// object in the world
export class HudObject extends StageObject
{
    constructor(name)
    {
        super(name);
    } 

    setPosition(x, y)
    {
        this.setWorldPosition(x, y);
    }

    getInteractableRect()
    {
        // invert bounds by default
        var bounds = this.graphic.getBounds();
        return {x:bounds.x, y:(bounds.y - window.innerHeight) * -1 - bounds.height, width:bounds.width, height:bounds.height};
    }
}

export class HudText extends HudObject
{
    constructor(name, text, textStyle, resolution)
    {
        super(name);
        this.setGraphic(new PIXI.Text(text, textStyle));
        this.graphic.scale.y = -1;
        this.graphic.resolution = resolution;
        this.graphic.zIndex = 1;
    }

    setText(text)
    {
        this.graphic.text = text;
    }
}

export class DevObject extends HudObject
{
    constructor(name)
    {
        super(name);
    }
}

export class WorldText extends StageObject
{
    constructor(name, textString, textStyle)
    {
        super(name);
        
        this.setGraphic(new PIXI.Text(textString, textStyle))
        this.graphic.resolution = 64;
        this.graphic.anchor.set(0, 1); // set anchor bottom left to scale properly with object children and what not
        this.graphic.scale.y = -1
    }
}

export class Overlay extends StageObject
{
    constructor(name, textString, textStyle)
    {
        super(name);
    }
}

export function SpawnObject(object)
{
    for(var i = 0; i < object.children.length; i++)
        SpawnObject(object.children[i]);

    if(object instanceof DevObject)
    {
        DEV_OBJECTS.push(object);
        if(object.graphic == null)
            return;

        APP.devContainer.addChild(object.graphic);
        return;
    }

    if(object instanceof HudObject)
    {
        HUD_OBJECTS.push(object);
        if(object.graphic == null)
            return;

        APP.hudContainer.addChild(object.graphic);
        return;
    }

    OBJECTS.push(object);
    if(object.graphic == null)
    {
        // if the graphic was null, then its just an empty parent
        // used to group stuff up
        return;
    }

    if(object instanceof WorldText)
        APP.overlayContainer.addChild(object.graphic);
    else if(object instanceof Overlay)
        APP.overlayContainer.addChild(object.graphic);
    else if(object instanceof WorldObject)
        APP.objectContainer.addChild(object.graphic);
    else if(object instanceof StageObject)
        APP.overlayContainer.addChild(object.graphic);
    else
        APP.objectContainer.addChild(object.graphic);
}

export function DeleteObject(object)
{
    for(var i = 0; i < object.children.length; i++)
        DeleteObject(object.children[i]);

    if(object instanceof DevObject)
    {
        var index = DEV_OBJECTS.indexOf(object);
        if(index > -1)
            DEV_OBJECTS.splice(index, 1);

        if(object.graphic == null)
            return;

        APP.devContainer.removeChild(object.graphic);
        return;
    }

    if(object instanceof HudObject)
    {
        var index = HUD_OBJECTS.indexOf(object);
        if(index > -1)
            HUD_OBJECTS.splice(index, 1);

        if(object.graphic == null)
            return;

        APP.hudContainer.removeChild(object.graphic);
        return;
    }

    var index = OBJECTS.indexOf(object);
    if(index > -1)
        OBJECTS.splice(index, 1);

    if(SELECTED_OBJECT == object)
        INPUT.deselectObject();

    if(object.graphic == null)
    {
        // if the graphic was null, then its just an empty parent
        // used to group stuff up
        return;
    }

    if(object instanceof WorldText)
        APP.overlayContainer.removeChild(object.graphic);
    else if(object instanceof Overlay)
        APP.overlayContainer.removeChild(object.graphic);
    else if(object instanceof WorldObject)
        APP.objectContainer.removeChild(object.graphic);
    else if(object instanceof StageObject)
        APP.overlayContainer.removeChild(object.graphic);
    else
        APP.objectContainer.removeChild(object.graphic);
}